import { toString } from "mdast-util-to-string";
import type { Content, Heading, Link, List, Paragraph, Root } from "mdast";
import remarkParse from "remark-parse";
import { unified } from "unified";

export interface ExerciseSection {
  id: string;
  title: string;
  nodes: Content[];
}

export interface ExerciseMeta {
  slug: string;
  title: string;
  summary?: string;
  area?: string;
  focus?: string;
  duration?: string;
  difficulty?: string;
  tags: string[];
  related: string[];
  sections: ExerciseSection[];
}

const rawModules = import.meta.glob("@uebungen/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw"
});

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function slugFromPath(path: string): string {
  const normalized = normalizePath(path);
  const match = normalized.match(/Übungen\/([^/]+)\.md$/i);
  if (!match) {
    throw new Error(`Ungültiger Pfad für Übung: ${path}`);
  }
  return match[1];
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function extractText(nodes: Content[]): string {
  return nodes
    .map((child) => toString(child).trim())
    .filter(Boolean)
    .join("\n");
}

function parseKeyValueList(nodes: Content[]): Record<string, string> {
  const result: Record<string, string> = {};
  const listNode = nodes.find((node): node is List => node.type === "list");

  if (!listNode) {
    return result;
  }

  for (const item of listNode.children) {
    const paragraph = item.children.find((child): child is Paragraph => child.type === "paragraph");
    if (!paragraph) {
      continue;
    }

    const [first, ...rest] = paragraph.children;
    let key: string | undefined;
    let valueNodes = rest;

    if (first && first.type === "strong") {
      key = toString(first).replace(/:$/, "").trim();
    } else {
      const text = toString(paragraph);
      const [rawKey, rawValue] = text.split(/:\s*/);
      if (rawKey) {
        key = rawKey.trim();
      }
      if (rest.length === 0 && rawValue) {
        valueNodes = [{ type: "text", value: rawValue.trim() } as const];
      }
    }

    const value = toString({ type: "paragraph", children: valueNodes } as Paragraph).trim();

    if (key && value) {
      result[normalizeKey(key)] = value;
    }
  }

  return result;
}

function extractTags(tree: Root): string[] {
  for (const node of tree.children) {
    if (node.type !== "paragraph") {
      continue;
    }
    const paragraph = node as Paragraph;
    const [first] = paragraph.children;
    if (!first || first.type !== "strong") {
      continue;
    }
    const label = toString(first).trim().toLowerCase();
    if (label !== "tags") {
      continue;
    }
    const text = toString(paragraph).replace(/^tags:\s*/i, "").trim();
    return text
      .split(/\s+/)
      .map((tag) => tag.replace(/^#/, "").trim())
      .filter(Boolean);
  }

  return [];
}

function extractRelated(nodes: Content[]): string[] {
  const listNode = nodes.find((node): node is List => node.type === "list");
  if (!listNode) {
    return [];
  }

  const slugs: string[] = [];

  for (const item of listNode.children) {
    const paragraph = item.children.find((child): child is Paragraph => child.type === "paragraph");
    if (!paragraph) {
      continue;
    }

    const linkNode = paragraph.children.find((child): child is Link => child.type === "link");
    if (!linkNode) {
      continue;
    }

    const match = linkNode.url.match(/([^/]+)\.md$/);
    if (match) {
      slugs.push(match[1]);
    }
  }

  return slugs;
}

function parseExercise(path: string, source: string): ExerciseMeta {
  const slug = slugFromPath(path);
  const tree = unified().use(remarkParse).parse(source) as Root;

  let title = slug;
  const sections: ExerciseSection[] = [];
  let currentSection: ExerciseSection | undefined;

  for (const node of tree.children) {
    if (node.type === "heading") {
      const heading = node as Heading;
      if (heading.depth === 1) {
        title = toString(heading).trim() || title;
        currentSection = undefined;
        continue;
      }

      if (heading.depth === 2) {
        const sectionTitle = toString(heading).trim();
        const sectionId = normalizeKey(sectionTitle) || `abschnitt-${sections.length + 1}`;
        currentSection = { id: sectionId, title: sectionTitle, nodes: [] };
        sections.push(currentSection);
        continue;
      }
    }

    if (currentSection) {
      currentSection.nodes.push(node);
    }
  }

  const sectionMap = new Map(sections.map((section) => [normalizeKey(section.title), section]));

  const summary = extractText(sectionMap.get(normalizeKey("Beschreibung"))?.nodes ?? []);
  const categoryInfo = parseKeyValueList(sectionMap.get(normalizeKey("Kategorie"))?.nodes ?? []);
  const related = extractRelated(sectionMap.get(normalizeKey("Verwandte Übungen"))?.nodes ?? []);
  const tags = extractTags(tree);

  return {
    slug,
    title,
    summary: summary || undefined,
    area: categoryInfo["bereich"],
    focus: categoryInfo["schwerpunkt"],
    duration: categoryInfo["dauer"],
    difficulty: categoryInfo["schwierigkeitsgrad"],
    tags,
    related,
    sections
  };
}

const allExercises: ExerciseMeta[] = Object.entries(rawModules)
  // Filter out template files
  .filter(([path]) => !path.includes('_template'))
  .map(([path, value]) => parseExercise(path, value as string));

allExercises.sort((a, b) => a.title.localeCompare(b.title, "de"));

const exerciseMap = new Map(allExercises.map((exercise) => [exercise.slug, exercise]));
const exerciseTitleMap = new Map(
  allExercises.map((exercise) => [normalizeKey(exercise.title), exercise.slug])
);

export const exercises = [...allExercises];

export function getExercise(slug: string): ExerciseMeta | undefined {
  return exerciseMap.get(slug);
}

export function findExerciseSlugByTitle(title: string): string | undefined {
  return exerciseTitleMap.get(normalizeKey(title));
}

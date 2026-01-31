import matter from "gray-matter";
import { toString } from "mdast-util-to-string";
import { unified } from "unified";
import remarkParse from "remark-parse";
import type { Content, Heading, List, ListItem, Paragraph, Root } from "mdast";

export interface SessionExerciseDetail {
  label: string;
  value: string;
}

export interface SessionExercise {
  title: string;
  details: SessionExerciseDetail[];
}

export interface SessionPhase {
  title: string;
  description?: string;
  exercises: SessionExercise[];
}

export interface SessionMeta {
  slug: string;
  title: string;
  description?: string;
  duration?: string;
  focus?: string;
  phases: SessionPhase[];
  exercises: SessionExercise[];
  categorySlug: string;
  categoryTitle: string;
}

export interface CategoryMeta {
  slug: string;
  title: string;
  description?: string;
  focusTags: string[];
  sessions: SessionMeta[];
}

const rawModules = import.meta.glob("@stunden/**/*.md", {
  eager: true,
  import: "default",
  query: "?raw"
});

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

function slugPartsFromPath(path: string): { categorySlug: string; sessionSlug: string } {
  const normalized = normalizePath(path);
  const match = normalized.match(/stunden\/([^/]+)\/([^/]+)\.md$/);
  if (!match) {
    throw new Error(`Ungültiger Pfad für Stunde: ${path}`);
  }
  return { categorySlug: match[1], sessionSlug: match[2] };
}

function humanizeSlug(slug: string): string {
  const replacements: Record<string, string> = {
    ae: "ä",
    oe: "ö",
    ue: "ü",
    ss: "ß"
  };

  const words = slug.split("-").map((word) => {
    let result = word;
    for (const [search, replacement] of Object.entries(replacements)) {
      result = result.replace(new RegExp(search, "gi"), (value) => {
        const isUpper = value === value.toUpperCase();
        return isUpper ? replacement.toUpperCase() : replacement;
      });
    }
    return result.charAt(0).toUpperCase() + result.slice(1);
  });

  return words.join(" ");
}

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function extractText(nodes: Content[]): string {
  return nodes
    .map((child) => toString(child).trim())
    .filter(Boolean)
    .join("\n");
}

function parseDetail(item: ListItem): SessionExerciseDetail | undefined {
  const paragraph = item.children.find((child): child is Paragraph => child.type === "paragraph");
  if (!paragraph) {
    return undefined;
  }

  const [first, ...rest] = paragraph.children;
  let label = "Hinweis";
  let valueNodes = paragraph.children;

  if (first && first.type === "strong") {
    label = toString(first).replace(/:$/, "").trim();
    valueNodes = rest.length > 0 ? rest : [{ type: "text", value: "" } as const];
  }

  const value = toString({ type: "paragraph", children: valueNodes } as Paragraph).trim();
  return value ? { label, value } : undefined;
}

function parseExercises(sectionNodes: Content[]): SessionExercise[] {
  const exercises: SessionExercise[] = [];
  const listNodes = sectionNodes.filter((node): node is List => node.type === "list");

  if (listNodes.length === 0) {
    return exercises;
  }

  for (const listNode of listNodes) {
    for (const item of listNode.children) {
      const titleNode = item.children.find((child): child is Paragraph => child.type === "paragraph");
      const title = titleNode ? toString(titleNode).trim() : "Übung";

      const detailList = item.children.find((child): child is List => child.type === "list");
      const details: SessionExerciseDetail[] = [];

      if (detailList) {
        for (const detailItem of detailList.children) {
          const detail = parseDetail(detailItem);
          if (detail) {
            details.push(detail);
          }
        }
      }

      exercises.push({ title, details });
    }
  }

  return exercises;
}

function parseSession(path: string, source: string): SessionMeta {
  const { categorySlug, sessionSlug } = slugPartsFromPath(path);
  const categoryTitle = humanizeSlug(categorySlug);
  const { data, content } = matter(source);

  const tree = unified().use(remarkParse).parse(content) as Root;

  let title = humanizeSlug(sessionSlug);
  let currentSection: string | null = null;
  const sections: Record<string, Content[]> = {};
  const phases: SessionPhase[] = [];
  let inPhasenplan = false;
  let currentPhase: { title: string; description?: string; nodes: Content[] } | null = null;

  for (const node of tree.children) {
    if (node.type === "heading") {
      const heading = node as Heading;
      const headingText = toString(heading).trim();

      if (heading.depth === 1) {
        title = headingText;
        currentSection = null;
        inPhasenplan = false;
        continue;
      }

      if (heading.depth === 2) {
        currentSection = normalizeKey(headingText);
        sections[currentSection] = [];
        inPhasenplan = currentSection === normalizeKey("Phasenplan");

        // Save previous phase if exists
        if (currentPhase) {
          phases.push({
            title: currentPhase.title,
            description: currentPhase.description,
            exercises: parseExercises(currentPhase.nodes)
          });
          currentPhase = null;
        }
        continue;
      }

      if (heading.depth === 3 && inPhasenplan) {
        // Save previous phase if exists
        if (currentPhase) {
          phases.push({
            title: currentPhase.title,
            description: currentPhase.description,
            exercises: parseExercises(currentPhase.nodes)
          });
        }

        // Start new phase
        currentPhase = {
          title: headingText,
          nodes: []
        };
        continue;
      }
    }

    if (currentPhase) {
      // Check if this is a paragraph starting with **Ziel:**
      if (node.type === "paragraph") {
        const text = toString(node);
        if (text.startsWith("Ziel:")) {
          currentPhase.description = text.replace(/^Ziel:\s*/, "").trim();
          continue;
        }
      }
      currentPhase.nodes.push(node);
    } else if (currentSection) {
      sections[currentSection].push(node);
    }
  }

  // Save last phase if exists
  if (currentPhase) {
    phases.push({
      title: currentPhase.title,
      description: currentPhase.description,
      exercises: parseExercises(currentPhase.nodes)
    });
  }

  const description = (data.beschreibung as string | undefined)?.trim() ?? extractText(sections["beschreibung"] ?? []);
  const duration = (data.dauer as string | undefined)?.trim() ?? extractText(sections["dauer"] ?? []);
  const focus = (data.fokus as string | undefined)?.trim() ?? extractText(sections["fokus"] ?? []);

  // Fallback for old format without phases
  const allExercises = phases.length > 0
    ? phases.flatMap(phase => phase.exercises)
    : parseExercises(sections["ubungen"] ?? sections["übungen"] ?? sections[normalizeKey("Phasenplan")] ?? []);

  return {
    slug: sessionSlug,
    title,
    description: description || undefined,
    duration: duration || undefined,
    focus: focus || undefined,
    phases,
    exercises: allExercises,
    categorySlug,
    categoryTitle
  };
}

const allSessions: SessionMeta[] = Object.entries(rawModules)
  // Filter out template files
  .filter(([path]) => !path.includes('_template'))
  .map(([path, value]) => parseSession(path, value as string));

const categoryMap = new Map<string, CategoryMeta>();

for (const session of allSessions) {
  const existing = categoryMap.get(session.categorySlug);
  if (!existing) {
    categoryMap.set(session.categorySlug, {
      slug: session.categorySlug,
      title: session.categoryTitle,
      description: session.description,
      focusTags: session.focus ? session.focus.split(",").map((entry) => entry.trim()).filter(Boolean) : [],
      sessions: [session]
    });
    continue;
  }

  existing.sessions.push(session);
  if (!existing.description && session.description) {
    existing.description = session.description;
  }
  if (session.focus) {
    const parts = session.focus.split(",").map((entry) => entry.trim()).filter(Boolean);
    for (const part of parts) {
      if (!existing.focusTags.includes(part)) {
        existing.focusTags.push(part);
      }
    }
  }
}

for (const category of categoryMap.values()) {
  category.sessions.sort((a, b) => a.title.localeCompare(b.title, "de"));
  category.focusTags.sort((a, b) => a.localeCompare(b, "de"));
}

export const categories = Array.from(categoryMap.values()).sort((a, b) =>
  a.title.localeCompare(b.title, "de")
);

export function getCategory(slug: string): CategoryMeta | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getSession(categorySlug: string, sessionSlug: string): SessionMeta | undefined {
  return allSessions.find(
    (session) => session.categorySlug === categorySlug && session.slug === sessionSlug
  );
}

export function getAllSessions(): SessionMeta[] {
  return [...allSessions];
}

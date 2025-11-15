import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

type ContentType = "stunde" | "übung" | "konzept";

interface ContentEntry {
  id: string;
  type: ContentType;
  path: string;
  title: string;
  concepts: string[];
  phases: string[];
  tags: string[];
  summary?: string;
}

interface SourceDefinition {
  dir: string;
  type: ContentType;
}

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SITE_PUBLIC_DIR = path.join(ROOT_DIR, "site", "public");
const OUTPUT_FILE = path.join(SITE_PUBLIC_DIR, "content-index.json");

const SOURCES: SourceDefinition[] = [
  { dir: "Stunden", type: "stunde" },
  { dir: "Übungen", type: "übung" },
  { dir: "Konzepte", type: "konzept" }
];

async function readMarkdownFiles(source: SourceDefinition): Promise<ContentEntry[]> {
  const absoluteDir = path.join(ROOT_DIR, source.dir);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

  const markdownFiles = entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".md") && !entry.name.startsWith("_"))
    .map((entry) => path.join(absoluteDir, entry.name));

  const results: ContentEntry[] = [];

  for (const filePath of markdownFiles) {
    const relativePath = path.relative(ROOT_DIR, filePath).replace(/\\/g, "/");
    const raw = await fs.readFile(filePath, "utf8");

    const title = extractTitle(raw);
    const concepts = new Set<string>(extractConcepts(raw));
    const phases = new Set<string>(extractPhases(raw));
    const tags = new Set<string>(extractTags(raw));

    if (source.type === "konzept" && title) {
      const normalized = title.replace(/^Konzept:?\s*/i, "").trim();
      if (normalized) {
        concepts.add(normalized);
      }
    }

    const summary = extractSummary(source.type, raw);

    results.push({
      id: `${source.type}:${relativePath}`,
      type: source.type,
      path: relativePath,
      title,
      concepts: Array.from(concepts),
      phases: Array.from(phases),
      tags: Array.from(tags),
      summary
    });
  }

  return results;
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? cleanText(match[1]) : "Unbenannt";
}

function extractConcepts(content: string): string[] {
  const concepts: string[] = [];
  const regex = /\*\*Konzept\*\*:\s*([^\n]+)/gi;
  for (const match of content.matchAll(regex)) {
    concepts.push(...splitMetadataValues(match[1]));
  }
  return concepts;
}

function extractTags(content: string): string[] {
  const tags: string[] = [];
  const regex = /\*\*Tags\*\*:\s*([^\n]+)/gi;
  for (const match of content.matchAll(regex)) {
    const raw = match[1]
      .replace(/[,;]/g, " ")
      .split(/\s+/)
      .map((token) => token.replace(/^#/, "").trim())
      .filter(Boolean);
    tags.push(...raw);
  }
  return tags;
}

function extractPhases(content: string): string[] {
  const phases = new Set<string>();

  const labeledRegex = /\*\*(?:Phase|Bereich)\*\*:\s*([^\n]+)/gi;
  for (const match of content.matchAll(labeledRegex)) {
    splitMetadataValues(match[1]).forEach((value) => phases.add(value));
  }

  const numberedSections = /^##\s+\d+\.?\s*([^\n]+)/gim;
  for (const match of content.matchAll(numberedSections)) {
    const cleaned = match[1].replace(/\([^)]*\)/g, "").trim();
    if (cleaned) {
      phases.add(cleanText(cleaned));
    }
  }

  const phaseHeadings = /^###\s+Phase:?\s*([^\n]+)/gim;
  for (const match of content.matchAll(phaseHeadings)) {
    const cleaned = cleanText(match[1]);
    if (cleaned) {
      phases.add(cleaned);
    }
  }

  return Array.from(phases);
}

function extractSummary(type: ContentType, content: string): string | undefined {
  let section: string | undefined;

  if (type === "stunde") {
    section = extractSection(content, "Übersicht");
  } else if (type === "übung") {
    section = extractSection(content, "Beschreibung");
  } else if (type === "konzept") {
    section = extractSection(content, "(?:🎯\\s+)?Ziel");
  }

  if (!section) {
    section = extractFirstParagraph(content);
  }

  if (!section) {
    return undefined;
  }

  const summary = cleanText(section).slice(0, 220);
  return summary || undefined;
}

function extractSection(content: string, headingPattern: string): string | undefined {
  const regex = new RegExp(`##\\s+${headingPattern}([\\s\\S]*?)(?:\n##\\s|\n###\\s|$)`, "i");
  const match = content.match(regex);
  return match ? match[1].trim() : undefined;
}

function extractFirstParagraph(content: string): string | undefined {
  const withoutTitle = content.replace(/^#.+$/m, "").trim();
  const lines = withoutTitle.split(/\r?\n/);
  const collected: string[] = [];
  for (const line of lines) {
    if (!line.trim()) {
      if (collected.length) {
        break;
      }
      continue;
    }
    if (line.startsWith("#")) {
      if (collected.length) {
        break;
      }
      continue;
    }
    collected.push(line);
    if (line.endsWith(".")) {
      break;
    }
  }
  return collected.length ? collected.join(" ") : undefined;
}

function splitMetadataValues(value: string): string[] {
  return value
    .split(/[,;\|]/)
    .map((item) => cleanText(item))
    .filter(Boolean);
}

function cleanText(input: string): string {
  return input
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[-*_]{2,}/g, " ")
    .replace(/#+\s*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

async function ensureOutputDir(): Promise<void> {
  await fs.mkdir(SITE_PUBLIC_DIR, { recursive: true });
}

async function main(): Promise<void> {
  const allEntries: ContentEntry[] = [];

  for (const source of SOURCES) {
    const entries = await readMarkdownFiles(source);
    allEntries.push(...entries);
  }

  allEntries.sort((a, b) => a.title.localeCompare(b.title, "de"));

  await ensureOutputDir();
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(allEntries, null, 2), "utf8");
  // eslint-disable-next-line no-console
  console.log(`Content-Index mit ${allEntries.length} Einträgen erstellt: ${path.relative(ROOT_DIR, OUTPUT_FILE)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

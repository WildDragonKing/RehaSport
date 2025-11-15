import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

interface ContentEntry {
  title: string;
  summary: string | null;
  category: string;
  relativePath: string;
  lastModified: string;
  branch?: string;
  repository?: string;
}

interface ContentIndex {
  generatedAt: string;
  branch: string;
  repository: string | null;
  entries: ContentEntry[];
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'site', 'public', 'data', 'content-index.json');
const SOURCE_DIRECTORIES = [
  'Anleitung',
  'Konzepte',
  'Stunden',
  'Übungen'
];

async function collectMarkdownFiles(): Promise<string[]> {
  const files: string[] = [];
  for (const directory of SOURCE_DIRECTORIES) {
    const dirPath = path.join(ROOT_DIR, directory);
    const exists = await pathExists(dirPath);
    if (!exists) {
      continue;
    }
    const dirFiles = await walkDirectory(dirPath);
    files.push(...dirFiles.filter((file) => file.endsWith('.md')));
  }
  return files;
}

async function walkDirectory(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const results: string[] = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      results.push(...(await walkDirectory(entryPath)));
    } else {
      results.push(entryPath);
    }
  }
  return results;
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function extractTitle(content: string, filePath: string): string {
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  return path.basename(filePath, path.extname(filePath));
}

function extractSummary(content: string): string | null {
  const sanitized = content
    .replace(/<!--.*?-->/gs, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/\r\n/g, '\n');
  const paragraphs = sanitized
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/^#+\s+/gm, '').replace(/^>\s+/gm, '').trim())
    .filter((paragraph) => paragraph.length > 0);
  const summary = paragraphs.find((paragraph) => !paragraph.startsWith('|'));
  return summary ?? null;
}

function determineCategory(filePath: string): string {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const [firstSegment] = relativePath.split(path.sep);
  return firstSegment ?? 'Unbekannt';
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join('/');
}

async function buildIndex(): Promise<void> {
  const files = await collectMarkdownFiles();
  const entries: ContentEntry[] = [];

  for (const file of files) {
    const fileContent = await fs.readFile(file, 'utf8');
    const parsed = parseFrontMatter(fileContent);
    const stats = await fs.stat(file);

    const entry: ContentEntry = {
      title: parsed.data.title ? String(parsed.data.title) : extractTitle(parsed.body, file),
      summary: parsed.data.summary ? String(parsed.data.summary) : extractSummary(parsed.body),
      category: determineCategory(file),
      relativePath: toPosixPath(path.relative(ROOT_DIR, file)),
      lastModified: stats.mtime.toISOString()
    };

    if (parsed.data.branch) {
      entry.branch = String(parsed.data.branch);
    }
    if (parsed.data.repository) {
      entry.repository = String(parsed.data.repository);
    }

    entries.push(entry);
  }

  entries.sort((a, b) => a.title.localeCompare(b.title, 'de'));

  const branch = process.env.GITHUB_REF_NAME || 'main';
  const repository = process.env.GITHUB_REPOSITORY || process.env.REHASPORT_REPOSITORY || 'buettgen/RehaSport';

  const index: ContentIndex = {
    generatedAt: new Date().toISOString(),
    branch,
    repository,
    entries
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, JSON.stringify(index, null, 2), 'utf8');
  console.log(`Inhaltsindex mit ${entries.length} Einträgen aktualisiert.`);
  console.log(`Ausgabedatei: ${path.relative(ROOT_DIR, OUTPUT_PATH)}`);
}

function parseFrontMatter(rawContent: string): { data: Record<string, unknown>; body: string } {
  if (!rawContent.startsWith('---')) {
    return { data: {}, body: rawContent };
  }

  const match = rawContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: rawContent };
  }

  const [, frontMatter, body = ''] = match;
  const data: Record<string, unknown> = {};

  for (const line of frontMatter.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }
    const colonIndex = trimmed.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }
    const key = trimmed.slice(0, colonIndex).trim();
    const value = trimmed.slice(colonIndex + 1).trim();
    if (!key) {
      continue;
    }
    data[key] = parseFrontMatterValue(value);
  }

  return { data, body };
}

function parseFrontMatterValue(value: string): unknown {
  if (value === 'true') return true;
  if (value === 'false') return false;
  if (!Number.isNaN(Number(value))) {
    return Number(value);
  }
  const quoted = value.match(/^['"](.*)['"]$/);
  if (quoted) {
    return quoted[1];
  }
  return value;
}

buildIndex().catch((error) => {
  console.error('Generierung des Inhaltsindex fehlgeschlagen:', error);
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

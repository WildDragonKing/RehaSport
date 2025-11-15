import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const OUTPUT_PATH = path.join(ROOT_DIR, 'site', 'public', 'data', 'content-index.json');
const SOURCE_DIRECTORIES = ['Anleitung', 'Konzepte', 'Stunden', 'Übungen'];

async function collectMarkdownFiles() {
  const files = [];
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

async function walkDirectory(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const results = [];
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

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

function extractTitle(content, filePath) {
  const headingMatch = content.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  return path.basename(filePath, path.extname(filePath));
}

function extractSummary(content) {
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

function determineCategory(filePath) {
  const relativePath = path.relative(ROOT_DIR, filePath);
  const [firstSegment] = relativePath.split(path.sep);
  return firstSegment ?? 'Unbekannt';
}

function toPosixPath(filePath) {
  return filePath.split(path.sep).join('/');
}

function parseFrontMatter(rawContent) {
  if (!rawContent.startsWith('---')) {
    return { data: {}, body: rawContent };
  }

  const match = rawContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: rawContent };
  }

  const [, frontMatter, body = ''] = match;
  const data = {};

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

function parseFrontMatterValue(value) {
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

async function buildIndex() {
  const files = await collectMarkdownFiles();
  const entries = [];

  for (const file of files) {
    const fileContent = await fs.readFile(file, 'utf8');
    const parsed = parseFrontMatter(fileContent);
    const stats = await fs.stat(file);

    const entry = {
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

  const index = {
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

buildIndex().catch((error) => {
  console.error('Generierung des Inhaltsindex fehlgeschlagen:', error);
  process.exitCode = 1;
});

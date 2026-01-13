#!/usr/bin/env node

/**
 * Content-Validierungs-Script für RehaSport
 *
 * Prüft Übungen und Stunden auf Vollständigkeit gemäß Templates.
 *
 * Verwendung:
 *   node scripts/validate-content.js              # Alle validieren
 *   node scripts/validate-content.js --exercises  # Nur Übungen
 *   node scripts/validate-content.js --sessions   # Nur Stunden
 *   node scripts/validate-content.js path/to/file # Einzelne Datei
 */

import { readdir, readFile } from "node:fs/promises";
import { resolve, join, basename, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..");

// Pflichtfelder für Übungen
const REQUIRED_EXERCISE_SECTIONS = [
  "Kategorie",
  "Beschreibung",
  "Ausführung",
  "Zielmuskulatur",
  "Nicht geeignet für / Kontraindikationen",
  "Alternativen"
];

const REQUIRED_CATEGORY_FIELDS = ["Bereich", "Schwerpunkt", "Dauer", "Schwierigkeitsgrad"];

const REQUIRED_ALTERNATIVE_SUBSECTIONS = ["Bei Knieproblemen", "Bei Schulterproblemen"];

// Pflichtfelder für Stunden
const REQUIRED_FRONTMATTER = ["beschreibung", "dauer", "fokus"];

const REQUIRED_PHASE_NAMES = [
  "Phase 1: Aufwärmen",
  "Phase 2: Hauptteil",
  "Phase 3: Schwerpunkt",
  "Phase 4: Ausklang"
];

class ValidationError {
  constructor(file, line, message, suggestion) {
    this.file = file;
    this.line = line;
    this.message = message;
    this.suggestion = suggestion;
  }

  toString() {
    const lineInfo = this.line ? ` (Zeile ~${this.line})` : "";
    const suggestionInfo = this.suggestion ? `\n     Hilfe: ${this.suggestion}` : "";
    return `  - ${this.message}${lineInfo}${suggestionInfo}`;
  }
}

function findLineNumber(content, searchText) {
  const lines = content.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(searchText.toLowerCase())) {
      return i + 1;
    }
  }
  return null;
}

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split("\n");

  for (const line of lines) {
    const colonIndex = line.indexOf(":");
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      frontmatter[key] = value;
    }
  }

  return frontmatter;
}

function extractSections(content) {
  const sections = new Map();
  const lines = content.split("\n");
  let currentH2 = null;
  let currentH3 = null;
  let sectionContent = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## ")) {
      if (currentH2) {
        sections.set(currentH2.toLowerCase(), {
          content: sectionContent.join("\n"),
          line: currentH2Line
        });
      }
      currentH2 = line.slice(3).trim();
      var currentH2Line = i + 1;
      currentH3 = null;
      sectionContent = [];
    } else if (line.startsWith("### ")) {
      if (currentH2) {
        const h3Title = line.slice(4).trim();
        sections.set(`${currentH2.toLowerCase()}/${h3Title.toLowerCase()}`, {
          content: "",
          line: i + 1
        });
      }
      currentH3 = line.slice(4).trim();
    } else {
      sectionContent.push(line);
    }
  }

  if (currentH2) {
    sections.set(currentH2.toLowerCase(), {
      content: sectionContent.join("\n"),
      line: currentH2Line
    });
  }

  return sections;
}

function validateExercise(filePath, content) {
  const errors = [];
  const fileName = basename(filePath);

  // Skip template
  if (fileName.startsWith("_template")) {
    return errors;
  }

  // Check H1 title
  if (!content.match(/^# .+/m)) {
    errors.push(new ValidationError(filePath, 1, "Fehlender H1-Titel", "Füge einen Titel mit # hinzu"));
  }

  const sections = extractSections(content);

  // Check required sections
  for (const sectionName of REQUIRED_EXERCISE_SECTIONS) {
    const sectionKey = sectionName.toLowerCase();
    let found = false;

    for (const [key] of sections) {
      if (key.includes(sectionKey.split("/")[0].split(" ")[0])) {
        found = true;
        break;
      }
    }

    if (!found) {
      errors.push(
        new ValidationError(
          filePath,
          null,
          `Fehlende Sektion: "${sectionName}"`,
          "Siehe Anleitung/uebungen_erstellen.md"
        )
      );
    }
  }

  // Check category fields
  const kategorie = sections.get("kategorie");
  if (kategorie) {
    for (const field of REQUIRED_CATEGORY_FIELDS) {
      if (!kategorie.content.toLowerCase().includes(field.toLowerCase())) {
        errors.push(
          new ValidationError(
            filePath,
            kategorie.line,
            `Fehlendes Kategorie-Feld: "${field}"`,
            `Füge "- **${field}**: [Wert]" hinzu`
          )
        );
      }
    }
  }

  // Check alternative subsections
  const alternativen = sections.get("alternativen");
  if (alternativen) {
    for (const subsection of REQUIRED_ALTERNATIVE_SUBSECTIONS) {
      const subKey = `alternativen/${subsection.toLowerCase()}`;
      if (!sections.has(subKey)) {
        errors.push(
          new ValidationError(
            filePath,
            alternativen.line,
            `Fehlende Alternative: "${subsection}"`,
            `Füge "### ${subsection}" unter Alternativen hinzu`
          )
        );
      }
    }
  }

  // Check for Tags
  if (!content.includes("**Tags**:") && !content.includes("**tags**:")) {
    errors.push(
      new ValidationError(filePath, null, "Fehlende Tags", 'Füge am Ende "**Tags**: #tag1 #tag2" hinzu')
    );
  }

  return errors;
}

function validateSession(filePath, content) {
  const errors = [];
  const fileName = basename(filePath);

  // Check frontmatter
  const frontmatter = parseFrontmatter(content);

  for (const field of REQUIRED_FRONTMATTER) {
    if (!frontmatter[field]) {
      errors.push(
        new ValidationError(
          filePath,
          1,
          `Fehlendes Frontmatter-Feld: "${field}"`,
          `Füge "${field}: [Wert]" im Frontmatter hinzu`
        )
      );
    }
  }

  // Check H1 title
  if (!content.match(/^# .+/m)) {
    errors.push(new ValidationError(filePath, null, "Fehlender H1-Titel", "Füge einen Titel mit # hinzu"));
  }

  // Check required sections
  const requiredSections = ["Übersicht", "Lernziele", "Phasenplan"];
  const sections = extractSections(content);

  for (const sectionName of requiredSections) {
    let found = false;
    for (const [key] of sections) {
      if (key.includes(sectionName.toLowerCase())) {
        found = true;
        break;
      }
    }

    if (!found) {
      errors.push(
        new ValidationError(
          filePath,
          null,
          `Fehlende Sektion: "${sectionName}"`,
          "Siehe Anleitung/stunden_planen.md"
        )
      );
    }
  }

  // Check phases
  for (const phaseName of REQUIRED_PHASE_NAMES) {
    const lineNum = findLineNumber(content, phaseName);
    if (!lineNum) {
      errors.push(
        new ValidationError(
          filePath,
          null,
          `Fehlende Phase: "${phaseName}"`,
          "Alle 4 Phasen müssen vorhanden sein (10-15-15-5 oder 10-15-15-10)"
        )
      );
    }
  }

  // Check for Knie-Alternative and Schulter-Alternative in exercises
  const exerciseBlocks = content.split(/\d+\.\s*\[/);
  let exerciseIndex = 0;

  for (const block of exerciseBlocks.slice(1)) {
    exerciseIndex++;
    const exerciseName = block.split("]")[0];

    if (!block.toLowerCase().includes("knie-alternative")) {
      const line = findLineNumber(content, exerciseName);
      errors.push(
        new ValidationError(
          filePath,
          line,
          `Fehlende Knie-Alternative bei "${exerciseName}"`,
          'Füge "- **Knie-Alternative:** [Beschreibung]" hinzu'
        )
      );
    }

    if (!block.toLowerCase().includes("schulter-alternative")) {
      const line = findLineNumber(content, exerciseName);
      errors.push(
        new ValidationError(
          filePath,
          line,
          `Fehlende Schulter-Alternative bei "${exerciseName}"`,
          'Füge "- **Schulter-Alternative:** [Beschreibung]" hinzu'
        )
      );
    }
  }

  return errors;
}

async function getFiles(dir, pattern) {
  const files = [];

  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile() && extname(entry.name) === ".md" && !entry.name.startsWith("_")) {
        files.push(fullPath);
      }
    }
  }

  await walk(dir);
  return files;
}

async function validateFile(filePath) {
  // Normalize line endings to handle both Unix (LF) and Windows (CRLF)
  const rawContent = await readFile(filePath, "utf-8");
  const content = rawContent.replace(/\r\n/g, "\n");
  const isExercise = filePath.includes("Übungen") || filePath.includes("Uebungen");
  const isSession = filePath.includes("stunden");

  if (isExercise) {
    return validateExercise(filePath, content);
  } else if (isSession) {
    return validateSession(filePath, content);
  }

  return [];
}

async function main() {
  const args = process.argv.slice(2);

  let validateExercises = true;
  let validateSessions = true;
  let specificFiles = [];

  for (const arg of args) {
    if (arg === "--exercises") {
      validateSessions = false;
    } else if (arg === "--sessions") {
      validateExercises = false;
    } else if (!arg.startsWith("--")) {
      specificFiles.push(arg);
    }
  }

  let files = [];

  if (specificFiles.length > 0) {
    files = specificFiles.map((f) => resolve(f));
  } else {
    if (validateExercises) {
      const exerciseFiles = await getFiles(join(ROOT, "Übungen"), ".md");
      files.push(...exerciseFiles);
    }

    if (validateSessions) {
      const sessionFiles = await getFiles(join(ROOT, "stunden"), ".md");
      files.push(...sessionFiles);
    }
  }

  console.log(`\n📋 Validiere ${files.length} Dateien...\n`);

  let totalErrors = 0;
  const fileErrors = new Map();

  for (const file of files) {
    try {
      const errors = await validateFile(file);
      if (errors.length > 0) {
        fileErrors.set(file, errors);
        totalErrors += errors.length;
      }
    } catch (err) {
      console.error(`Fehler beim Lesen von ${file}: ${err.message}`);
    }
  }

  if (totalErrors === 0) {
    console.log("✅ Alle Dateien sind valide!\n");
    process.exit(0);
  }

  console.log(`❌ ${totalErrors} Fehler in ${fileErrors.size} Dateien gefunden:\n`);

  for (const [file, errors] of fileErrors) {
    const relativePath = file.replace(ROOT, "").replace(/^[/\\]/, "");
    console.log(`📄 ${relativePath}`);
    for (const error of errors) {
      console.log(error.toString());
    }
    console.log();
  }

  process.exit(1);
}

main().catch((err) => {
  console.error("Unerwarteter Fehler:", err);
  process.exit(1);
});

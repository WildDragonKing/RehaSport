---
name: improve
description: "Projekt-Audit starten. Prueft Security, Content, Performance und Code-Qualitaet parallel. Trackt Scores ueber Zeit. Optionen: --create-issues, --dimension=<name>, --quick"
allowed-tools:
  - Bash
  - Read
  - Glob
  - Grep
  - Write
  - Edit
  - Task
---

# Projekt-Audit: /improve

Fuehre ein vollstaendiges Audit des RehaSport-Projekts durch. Alle 4 Dimensionen werden parallel geprueft, gescored und mit dem vorherigen Lauf verglichen.

## Arguments
- `$ARGUMENTS` - Optionen: `--create-issues` (GitHub Issues anlegen), `--dimension=security|content|performance|code` (nur eine Dimension), `--quick` (vereinfacht)

## Phase 1: Vorbereitung

1. Vorherigen Score-Bericht einlesen:
```bash
cat /Users/lbuettge/Projects/personal/RehaSport/docs/improve-scores.json 2>/dev/null || echo "Kein vorheriger Bericht vorhanden"
```

2. Git-Kontext erfassen:
```bash
git -C /Users/lbuettge/Projects/personal/RehaSport branch --show-current
git -C /Users/lbuettge/Projects/personal/RehaSport rev-parse --short HEAD
```

3. Falls `--dimension=<name>` in `$ARGUMENTS`: Nur diese eine Dimension auditieren (ueberspringe die anderen in Phase 2).

## Phase 2: Parallele Audits

Spawne ALLE 4 Tasks GLEICHZEITIG mit dem Task-Tool in einer einzigen Message (maximale Parallelisierung).

### Task 1: Security Audit
- **subagent_type:** `security-reviewer` (aus `.claude/agents/security-reviewer.md`)
- **Prompt:**
```
Fuehre das Security-Audit fuer das RehaSport-Projekt durch.

Pruefe gemaess deiner Checkliste:
1. Firestore Rules (firestore.rules)
2. Frontend Security (site/src/)
3. Cloud Functions (functions/src/index.ts)
4. Authentication

Zusaetzlich:
- Fuehre `cd /Users/lbuettge/Projects/personal/RehaSport/site && npm audit 2>&1 | tail -20` aus
- Fuehre `cd /Users/lbuettge/Projects/personal/RehaSport/functions && npm audit 2>&1 | tail -20` aus
- Pruefe HTTP Security Headers in firebase.json

Gib am Ende eine JSON-Zusammenfassung in diesem Format:
{"score": <1-10>, "findings": [{"severity": "KRITISCH|WICHTIG|HINWEIS", "title": "...", "file": "...", "action": "..."}]}

Scoring: 10 = perfekt, -2 pro KRITISCH, -1 pro WICHTIG, -0.5 pro HINWEIS (Minimum: 1).
```

### Task 2: Content Audit
- **subagent_type:** `content-reviewer` (aus `.claude/agents/content-reviewer.md`)
- **Prompt:**
```
Fuehre das Content-Audit fuer das RehaSport-Projekt durch.

Pruefe gemaess deiner Checkliste:
1. TypeScript-Datenmodell (site/src/lib/types.ts)
2. KI-Generierungs-Prompts (functions/src/index.ts)
3. Firestore Security Rules (firestore.rules)
4. Content-Anzeige (site/src/components/react/)

Gib am Ende eine JSON-Zusammenfassung in diesem Format:
{"score": <1-10>, "findings": [{"severity": "KRITISCH|WICHTIG|HINWEIS", "title": "...", "file": "...", "action": "..."}]}

Scoring: 10 = alle Checklisten-Punkte erfuellt, -2 pro KRITISCH, -1 pro WICHTIG.
```

### Task 3: Performance Audit
- **subagent_type:** `performance-analyzer` (aus `.claude/agents/performance-analyzer.md`)
- **Prompt:**
```
Fuehre die Performance-Analyse fuer das RehaSport-Projekt durch.

Pruefe gemaess deiner Schwerpunkte:
1. Astro Islands Hydration
2. Firebase SDK Bundle Size
3. React Component Performance
4. Build Output Analyse
5. Cloud Functions

Zusaetzlich:
- Fuehre `cd /Users/lbuettge/Projects/personal/RehaSport/site && npm run build 2>&1` aus
- Pruefe Bundle-Groessen: `ls -la /Users/lbuettge/Projects/personal/RehaSport/site/dist/_astro/ 2>/dev/null | sort -k5 -n -r | head -20`

Gib am Ende eine JSON-Zusammenfassung in diesem Format:
{"score": <1-10>, "findings": [{"severity": "KRITISCH|WICHTIG|HINWEIS", "title": "...", "file": "...", "action": "..."}]}

Scoring: 10 = perfekt, -2 pro KRITISCH, -1 pro WICHTIG, -0.5 pro HINWEIS (Minimum: 1).
```

### Task 4: Code Quality Audit
- **subagent_type:** `general-purpose`
- **Prompt:**
```
Fuehre ein Code-Quality-Audit fuer das RehaSport-Projekt durch.

Fuehre folgende Checks aus:

1. TypeScript Strict (Site):
   cd /Users/lbuettge/Projects/personal/RehaSport/site && npx tsc --noEmit 2>&1 | tail -20

2. TypeScript Strict (Functions):
   cd /Users/lbuettge/Projects/personal/RehaSport/functions && npx tsc --noEmit 2>&1 | tail -20

3. Test Coverage:
   cd /Users/lbuettge/Projects/personal/RehaSport/site && npx vitest run --coverage 2>&1 | tail -30
   Falls coverage-v8 nicht installiert: Zaehle manuell:
   - Test-Dateien: Glob fuer src/**/*.test.ts und src/**/*.test.tsx
   - Source-Dateien: Glob fuer src/lib/*.ts und src/components/**/*.tsx (ohne Tests und .d.ts)
   - Coverage-Proxy = Test-Dateien / Source-Dateien

4. ESLint-Status:
   Pruefe ob eine ESLint-Konfiguration existiert (.eslintrc*, eslint.config.*, package.json eslintConfig).

5. Unused Dependencies:
   cd /Users/lbuettge/Projects/personal/RehaSport/site && npx depcheck 2>&1 | head -30

6. Code-Komplexitaet:
   Zaehle Zeilen in den groessten Dateien:
   - functions/src/index.ts (>1000 Zeilen = WICHTIG: sollte aufgeteilt werden)
   - site/src/components/react/SessionsExplorer.tsx
   - site/src/components/react/ExercisesExplorer.tsx

Gib am Ende eine JSON-Zusammenfassung in diesem Format:
{"score": <1-10>, "findings": [{"severity": "KRITISCH|WICHTIG|HINWEIS", "title": "...", "file": "...", "action": "..."}]}

Scoring-Kriterien:
- 0 tsc-Fehler: +2
- Coverage > 50%: +3, > 20%: +2, < 20%: +0
- ESLint konfiguriert: +1
- Keine unused Dependencies: +2
- Keine Datei > 500 Zeilen: +2
Minimum: 1, Maximum: 10
```

## Phase 3: Ergebnisse sammeln und scoren

Sammle die JSON-Zusammenfassungen aller 4 Agents. Berechne:

**Gewichteter Gesamtscore:**
- Security: 30%
- Performance: 25%
- Code Quality: 25%
- Content: 20%

**Formel:** `overall = (security * 0.3) + (performance * 0.25) + (codeQuality * 0.25) + (content * 0.2)`

**Delta berechnen:** Falls ein vorheriger Score in `docs/improve-scores.json` existiert, berechne Delta pro Dimension und gesamt.

## Phase 4: Bericht ausgeben

Zeige dem User folgende Zusammenfassung:

```
=== RehaSport Projekt-Audit ===
Branch: <branch>  Commit: <hash>  Datum: <datum>

Gesamtscore: <overall>/10 (Delta: <+/- zum letzten Lauf>)

Security:     <balken> <score>/10 (Delta <delta>)
Content:      <balken> <score>/10 (Delta <delta>)
Performance:  <balken> <score>/10 (Delta <delta>)
Code Quality: <balken> <score>/10 (Delta <delta>)

Top Findings:
1. [<SEVERITY>] <title> (<dimension>) - <file>
   -> <action>
2. [<SEVERITY>] <title> (<dimension>) - <file>
   -> <action>
3. [<SEVERITY>] <title> (<dimension>) - <file>
   -> <action>
...
```

Balken-Format: Score 7 = `███████░░░`

## Phase 5: Score speichern

Aktualisiere `docs/improve-scores.json` (erstelle die Datei falls sie nicht existiert):

```json
{
  "runs": [
    {
      "date": "<ISO-Datum>",
      "branch": "<branch>",
      "commit": "<hash>",
      "overall": <score>,
      "dimensions": {
        "security": { "score": <n>, "findings": [...] },
        "content": { "score": <n>, "findings": [...] },
        "performance": { "score": <n>, "findings": [...] },
        "codeQuality": { "score": <n>, "findings": [...] }
      }
    }
  ]
}
```

**Wichtig:** Maximal 10 Runs speichern. Aelteste entfernen falls mehr als 10.

## Phase 6: Optional - GitHub Issues (nur mit --create-issues)

Falls `--create-issues` in den Argumenten:

Fuer jedes Finding mit Severity KRITISCH oder WICHTIG:
```bash
gh issue create \
  --repo "$(git remote get-url origin | sed 's/.*github.com[:/]\(.*\)\.git/\1/')" \
  --title "<dimension>: <finding-title>" \
  --body "<finding-details und action>" \
  --label "improve-audit"
```

Erstelle das Label falls es nicht existiert:
```bash
gh label create "improve-audit" --description "Automatisch vom /improve Audit erstellt" --color "6f42c1" 2>/dev/null
```

## Hinweise

- Der Skill laeuft typischerweise 2-3 Minuten (4 parallele Agents)
- `--quick` ueberspringt Build und Coverage-Check (nur statische Analyse)
- Die Score-Datei `docs/improve-scores.json` sollte commited werden (Teil der Projektdokumentation)
- Fuer CI-Integration: Die einzelnen Checks koennen spaeter als GitHub Actions Steps extrahiert werden

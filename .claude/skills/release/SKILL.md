---
name: release
description: Pre-Release-Check und PR zu main erstellen. CI erledigt Deploy + Auto-Tagging.
disable-model-invocation: true
---

# Release Workflow

Erstelle einen Release-PR vom aktuellen Feature-Branch zu main.
Die CI uebernimmt automatisch: Build, Test, Deploy, Version-Tag.

## Arguments
- `$ARGUMENTS` - Optionale Beschreibung der Aenderungen

## Voraussetzungen pruefen

```bash
# Darf nicht auf main sein
BRANCH=$(git branch --show-current)
if [ "$BRANCH" = "main" ]; then echo "FEHLER: Nicht auf main arbeiten - Feature-Branch noetig"; exit 1; fi

# Keine uncommitteten Aenderungen
git status --porcelain
```

## Release-Schritte

### 1. Tests ausfuehren
```bash
cd site && npm test
```

### 2. TypeScript-Check
```bash
cd site && npx astro check
```

### 3. Build-Verifikation (Site + Functions)
```bash
cd site && npm run build
cd ../functions && npm run build
```

### 4. Branch pushen
```bash
git push -u origin $(git branch --show-current)
```

### 5. PR erstellen
```bash
gh pr create --base main --head $(git branch --show-current) \
  --title "Release: $ARGUMENTS" \
  --body "## Aenderungen
- [Aenderungen aus Commits zusammenfassen]

## Verifikation
- [x] Tests bestanden
- [x] TypeScript-Check erfolgreich
- [x] Build erfolgreich (Site + Functions)

---
Nach Merge erledigt die CI automatisch:
- Firebase Deploy (Hosting + Functions + Rules)
- Version-Tag erstellen (Patch-Increment)
- GitHub Release mit auto-generierten Notes"
```

## Hinweise
- Direct Push zu main ist durch Branch Protection blockiert
- Die CI (`release.yml`) deployed und erstellt automatisch den naechsten Patch-Tag
- Fuer Major/Minor-Version: Tag manuell vor dem Merge setzen

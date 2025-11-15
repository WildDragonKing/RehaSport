# RehaSport Reader – Architekturüberblick

Der Reader stellt Markdown-Stunden ohne Backend dar. Dieses Dokument beschreibt Aufbau, Parsing und Navigationslogik.

## Inhaltsquellen

- **Ordnerstruktur**: Unter `stunden/` existiert je Kategorie ein Unterordner. Dateiname = URL-Slug der Stunde.
- **Markdown-Layout**: Jede Datei enthält Frontmatter (`beschreibung`, `dauer`, optional `fokus`) sowie die Abschnitte `## Beschreibung`, `## Dauer`, `## Fokus` und `## Übungen`.
- **Übungsdetails**: Unterpunkte mit `**Label:**` innerhalb der nummerierten Liste werden als Detailfelder interpretiert.

## Parsing-Pipeline (`site/src/content/sessions.ts`)

1. `import.meta.glob("@stunden/**/*.md", { as: "raw", eager: true })` lädt alle Markdown-Dateien als String.
2. `gray-matter` liest das Frontmatter und trennt Inhalt von Metadaten.
3. `remark-parse` erzeugt einen Markdown-AST. Überschriften definieren die Sektionen.
4. Aus `## Übungen` wird die nummerierte Liste extrahiert. Unterlisten werden zu `label/value`-Paaren.
5. Kategorie-Metadaten entstehen automatisch aus dem Ordnernamen (inkl. Umwandlung z. B. `ruecken` → `Rücken`).

Der Export liefert:

- `categories`: Alle Kategorien mit Stundenliste, Fokus-Tags und Beschreibung
- `getCategory(slug)`: Einzelne Kategorie abrufen
- `getSession(categorySlug, sessionSlug)`: Stunde inkl. Übungen abrufen
- `getAllSessions()`: Vollständige Liste, z. B. für spätere Features

## Frontend-Fluss (`site/src/App.tsx`)

| Route | Komponente | Zweck |
|-------|------------|-------|
| `/` | `HomePage` | Übersicht aller Ordner |
| `/ordner/:categorySlug` | `CategoryPage` | Listet Stunden eines Ordners |
| `/ordner/:categorySlug/:sessionSlug` | `SessionPage` | Reader-Ansicht der Stunde |
| `/info` | `InfoPage` | Hinweise zum Pflegeprozess |

### Reader-Ansicht

- Breadcrumb zeigt Pfad (Ordner → Stunde).
- `Aktive Übung` hebt den aktuell ausgewählten Block hervor.
- `Zurück` / `Weiter` Buttons steuern den aktiven Index.
- Übungsdetails erscheinen als Karte mit Grid-Layout.

## Styling & Komponenten

- Globale Variablen: `site/src/styles/theme.css`
- Layout- und Komponentenspezifische Klassen: `site/src/index.css`
- Buttons bleiben als einzige generische UI-Komponente (`Button.tsx`).

## Inhalte erweitern

1. Neuen Ordner in `stunden/` erstellen (z. B. `kraftausdauer/`).
2. Markdown-Datei mit oben beschriebenem Schema anlegen.
3. Vite erkennt neue Dateien automatisch – Reload genügt.

## Tests

`site/src/App.test.tsx` rendert die wichtigsten Routen per SSR und prüft, ob Kategorien, Stunden und Übungen erscheinen. Weitere Tests können denselben Ansatz nutzen, da keine API-Aufrufe nötig sind.

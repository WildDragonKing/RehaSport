# Projektüberblick: RehaSport Reader

## Zweck der Anwendung
Der Reader stellt vorbereitete RehaSport-Stunden aus Markdown-Dateien dar. Statt Kursbuchung oder Kontaktformular liegt der Fokus auf einer klaren Darstellung für Trainer*innen während des laufenden Trainings.

## Tech-Stack
- **Framework:** React 18 mit Vite
- **Routing:** `react-router-dom`
- **Markdown-Pipeline:** `gray-matter`, `remark-parse`, eigene Aggregation (`src/content/sessions.ts`)
- **Styles:** Theme-Variablen in `src/styles/theme.css`, Komponenten-Layout in `src/index.css`
- **Tests:** Vitest (`npm run test`) mit serverseitigem Rendering der wichtigsten Routen

## Struktur
- `src/App.tsx` – Routing für Übersicht, Ordner, Stunden und Info-Seite
- `src/components/layout/` – Header, Footer, PageLayout
- `src/components/ui/Button.tsx` – Zentrale Button-Komponente
- `src/content/` – Parser (`sessions.ts`) und erklärende Texte (`info.ts`)
- `src/pages/` – React-Seiten für Start (`HomePage`), Ordner (`CategoryPage`), Stunde (`SessionPage`) und Hinweise (`InfoPage`)
- `src/index.css` – Layout-, Typografie- und Komponentenstile

## Datenquellen
Alle Stunden liegen als Markdown in `../../stunden/`. Die Struktur lautet `<ordner>/<slug>.md`. Beispiel:

```
---
beschreibung: Schulter-Mobilisation.
dauer: 40 Minuten
fokus: Schulter, Brustwirbelsäule
---

# Schulter-Mobility Flow
## Beschreibung
...
```

Der Parser liest Frontmatter, Abschnitte und nummerierte Listen und formt daraus Kategorien, Stunden und Übungen.

## Erweiterungsideen
- Weitere Metadaten im Frontmatter (z. B. Intensität, benötigte Fläche)
- Geräteansicht mit automatischer Vollbild-Option
- Export als PDF-Handout

Diese Datei liefert nur einen Überblick. Details zur Pipeline findest du in `docs/reader-architektur.md`.

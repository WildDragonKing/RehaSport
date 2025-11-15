# Projektüberblick: RehaSport Zentrum

## Zweck der Anwendung
Die Webanwendung präsentiert das RehaSport-Angebot des Projekts mit einer klar strukturierten Startseite, einer Kursübersicht, Hintergrundinformationen zum Rehabilitationssport sowie einem Kontaktformular zur Kursanmeldung oder Beratung.

## Tech-Stack
- **Framework:** React 18 mit Vite
- **Routing:** `react-router-dom`
- **Styles:** Globale CSS-Dateien mit Design-Token (`src/styles/theme.css`, `src/index.css`)
- **Tests:** Vitest (`npm run test`)

## Struktur
- `src/App.tsx` – Routen-Definition und grundlegende Seitenstruktur
- `src/components/` – Layout-Komponenten (Header, Footer, PageLayout) und UI-Bausteine (Button, Card, Section, Kurskarten)
- `src/pages/` – Seiten für Start, Kurse, Info und Kontakt
- `src/content/` – Statische Inhalte wie Kursdaten, Highlights und Info-Texte
- `src/styles/` – Zentrales Theme mit Farb- und Typografie-Definitionen

## Datenquellen
Alle Inhalte werden aktuell statisch in TypeScript-Dateien gepflegt:
- Kurse: `src/content/courses.ts`
- Vorteile: `src/content/highlights.ts`
- Info & FAQ: `src/content/info.ts`

Die Daten können bei Bedarf über ein Headless CMS oder eine API ersetzt werden. Die Komponenten erwarten jeweils strukturierte Objekte aus diesen Dateien.

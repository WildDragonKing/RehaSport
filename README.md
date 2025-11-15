# RehaSport – Sammlung für Reha-Übungen und Stunden

Willkommen in unserem Projekt! Wir sammeln hier bewährte Übungen und komplette Stundenbilder, die Trainer*innen im Rehabilitationssport sofort einsetzen können. Das Ziel: Teilnehmern einen sicheren, abwechslungsreichen und motivierenden Reha-Alltag zu ermöglichen – unabhängig davon, ob sie Knie-, Schulter- oder Rückenbeschwerden mitbringen.

## Was dich hier erwartet
- **Übungen** mit leicht verständlichen Beschreibungen und passenden Alternativen.
- **45-Minuten-Stunden** mit klarer Struktur für Aufwärmen, Hauptteil, Schwerpunkt und Ausklang.
- **Konzepte** rund um Themen wie Balance, Mobilität oder Kraftaufbau.

## Mitmachen?
Super gern! Damit alles zusammenpasst, lies bitte vor dem Erstellen neuer Inhalte unsere [CONTRIBUTING.md](CONTRIBUTING.md). Dort findest du alle Qualitätsstandards, Templates und detaillierten Schritt-für-Schritt-Anleitungen.

Viel Spaß beim Stöbern – und danke, dass du RehaSport noch besser machst!

## Weiterentwickeln

### Projekt starten

- Abhängigkeiten installieren: `cd site && npm install`
- Entwicklungsserver: `npm run dev`
- Produktion bauen: `npm run build` (statischer Build im Ordner `site/dist`)
- Tests ausführen: `npm run test`

### Neue Inhalte und Komponenten

- **Seiten** liegen in `site/src/pages`. Nutze React Router (`react-router-dom`), um neue Routen hinzuzufügen (`src/App.tsx`).
- **UI-Bausteine** (Buttons, Karten, Sektionen) befinden sich unter `site/src/components/ui`. Erweitere diese Sammlung, statt Inline-Styles zu verwenden.
- **Statische Inhalte** wie Kurse oder Info-Texte werden in `site/src/content` gepflegt. Halte die Daten strukturiert (z.B. Typdefinitionen exportieren) und dokumentiere größere Änderungen in `docs/overview.md`.
- Das zentrale Styling ist in `site/src/styles/theme.css` (Design-Token) und `site/src/index.css` (Layout-Regeln) definiert. Bitte konsistente Variablen nutzen.

### Checkliste vor dem Deployment

- [ ] `npm run build` und `npm run test` laufen ohne Fehler.
- [ ] Startseite, Kursübersicht, Info und Kontaktformular funktionieren und sind erreichbar.
- [ ] Responsive Layout auf Desktop und Smartphone geprüft.
- [ ] Keine sichtbaren Layout-Brüche, Texte vollständig auf Deutsch.

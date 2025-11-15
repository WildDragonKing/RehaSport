# Projektanweisungen

## Geltungsbereich
Diese Richtlinien gelten für das gesamte Repository.

## Allgemeine Vorgaben
- Übernehme bestehende Sprachkonventionen der Dateien (z. B. Deutsch in den Textdokumenten).
- Strukturiere neue Inhalte so, dass sie sich nahtlos in die vorhandene Ordnerstruktur einfügen.
- Dokumentiere neue Befehle oder manuelle Schritte direkt in den passenden README- oder Anleitungskapiteln.
- Die `README.md` dient ausschließlich als kompakter Projektüberblick und soll keine tiefgehenden technischen Details enthalten.
- Nutze die verbindlichen Leitfäden im Verzeichnis `Anleitung/` (z. B. `stunden_planen.md`, `alternative_übungen.md`, `übungen_erstellen.md`) als Grundlage für Inhalte in den entsprechenden Bereichen.
- Verweise bei Konzept- oder Stundenanpassungen konsequent auf die Dateien im Ordner `Konzepte/` und halte die Querverlinkungen zwischen Konzepten, Stunden und Übungen aktuell.
- Halte alle Projektdokumente konsolidiert und vermeide redundante Inhalte; erstelle nur dann neue Markdown-Dateien, wenn sie zwingend notwendig und langfristig gepflegt werden.

## Abgleich der KI-Anweisungen
- Die Richtlinien in `AGENTS.md`, `.github/copilot-instructions.md` und `claude.md` müssen stets synchron gehalten werden.
- Übernehme relevante Wissensinhalte aus den KI-Anweisungen gegenseitig, sodass alle drei Dokumente dieselben Kernregeln widerspiegeln.
- Prüfe nach jeder Änderung an einem der Dokumente, ob Anpassungen in den beiden anderen erforderlich sind, und führe sie im selben Commit durch.

## Zentrale Projektleitplanken (Auszug aus den KI-Anweisungen)
- Trainingsstunden folgen strikt dem 45-Minuten-Schema (10 Min Aufwärmen, 15 Min Hauptteil, 15 Min Schwerpunkt, 10 Min Ausklang).
- Jede Übung benötigt dokumentierte Alternativen für Knie- (`🦵`) und Schulterbeschwerden (`💪`) sowie vollständige Kontraindikationen.
- Templates in `Übungen/` und `Stunden/` dürfen nicht verändert werden und sind stets die Ausgangsbasis für neue Inhalte.
- Alle Inhalte (inklusive Dateinamen) werden auf Deutsch verfasst und mit konsistenten Tags gemäß Dokumentation versehen.

## Frontend (Verzeichnis `site/`)
- Verwende ausschließlich funktionale React-Komponenten und Hooks (keine Klassenkomponenten).
- Halte dich an die vorgegebene Formatierung mit zwei Leerzeichen pro Einrückung und Doppelanführungszeichen für Strings.
- Führe bei relevanten Änderungen mindestens `npm install` (falls Abhängigkeiten geändert wurden) und `npm run test` aus.

## Skripte
- JavaScript-Dateien in `scripts/` sollen ES Modules nutzen und den bestehenden Stil (zwei Leerzeichen, doppelte Anführungszeichen) beibehalten.
- Beschreibe neue oder geänderte Skripte kurz in den jeweiligen Dokumentationen.

## Tests
- Falls Tests ergänzt werden müssen, platziere sie neben der zugehörigen Implementierung (z. B. `*.test.tsx`).
- Dokumentiere im Pull-Request-Text, welche Test- oder Build-Befehle ausgeführt wurden.

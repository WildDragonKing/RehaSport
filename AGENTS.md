# Projektanweisungen

## Geltungsbereich
Diese Richtlinien gelten für das gesamte Repository.

## Allgemeine Vorgaben
- Übernehme bestehende Sprachkonventionen der Dateien (z. B. Deutsch in den Textdokumenten).
- Strukturiere neue Inhalte so, dass sie sich nahtlos in die vorhandene Ordnerstruktur einfügen.
- Dokumentiere neue Befehle oder manuelle Schritte direkt in den passenden README- oder Anleitungskapiteln.

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

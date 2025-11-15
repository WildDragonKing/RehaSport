# System-Übersicht: RehaSport Reader

## Zweck des Projekts

Der Reader dient Trainer*innen als digitales Handbuch für RehaSport-Stunden. Alle Inhalte liegen in Markdown-Dateien, die ohne zusätzliche Datenbank oder Buchungslogik direkt in der App angezeigt werden.

## Projektstruktur

```
RehaSport/
├── README.md                      # Einstieg & Kurzanleitung
├── stunden/                       # Ordner für Stunden-Kategorien
│   └── <ordner>/<stunde>.md       # Eine Datei = eine Stunde
├── docs/                          # Architektur- und Pflegehinweise
└── site/                          # React-Frontend (Vite)
    ├── src/content/sessions.ts    # Markdown-Parsing & Aggregation
    ├── src/pages/                 # Seiten für Ordner & Reader
    └── src/index.css              # Layout & Komponenten
```

## Arbeitsablauf

1. **Ordner wählen**: Für jede Kategorie (z. B. `ruecken`, `balance`, `herz-kreislauf`) existiert ein Unterordner in `stunden/`.
2. **Markdown kopieren**: Nutze eine bestehende Datei als Vorlage. Frontmatter und Abschnittsstruktur beibehalten.
3. **Übungen pflegen**: Nummerierte Liste im Abschnitt `## Übungen`. Unterpunkte mit `**Label:**` für Details.
4. **Speichern**: Die App erkennt neue Dateien automatisch – Browser aktualisieren reicht.

## Aufbau einer Stunde

```markdown
---
beschreibung: Kurzer Überblick über Zielgruppe und Schwerpunkt.
dauer: 50 Minuten
fokus: Herz-Kreislauf, Koordination
---

# Titel der Stunde

## Beschreibung
Freitext für Trainer*innen.

## Dauer
50 Minuten

## Fokus
Optional – mehrere Begriffe mit Komma trennen.

## Übungen
1. Name der Übung
   - **Beschreibung:** Ablauf der Übung.
   - **Dauer/Wiederholungen:** Zeit oder Wiederholungen.
   - **Equipment:** Optionales Material.
   - **Hinweise:** Alternativen, Coaching-Tipps.
```

## Navigation in der App

- **Startseite**: Zeigt alle Ordner, sortiert nach Namen.
- **Ordnerseite**: Zeigt alle Stunden inkl. Dauer und Fokus.
- **Stundenseite**: Reader mit Aktive-Übung-Markierung, Vor-/Zurück-Steuerung und Detailansicht.

## Stil- und UX-Vorgaben

- Großzügige Abstände und klare Typografie (siehe `site/src/index.css`).
- Buttons und Links besitzen sichtbare Fokuszustände.
- Breadcrumb erleichtert die Orientierung während des Trainings.

## Tests & Qualitätssicherung

- `npm run test` rendert wichtige Seiten serverseitig und prüft Kerninhalte.
- Vor Deployments zusätzlich `npm run build` ausführen.

## Erweiterungen

- Neue Kategorien: Ordner in `stunden/` anlegen.
- Weitere Inhalte: Markdown-Dateien ergänzen – keine zusätzlichen Konfigurationen nötig.
- UI-Anpassungen: In `site/src/index.css` gepflegt, möglichst mit bestehenden Variablen arbeiten.

**Letzte Aktualisierung**: 14.11.2025

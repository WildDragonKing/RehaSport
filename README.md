# RehaSport Reader – Stunden aus Markdown

Der RehaSport Reader ist ein leichtgewichtiger Viewer für komplette Trainingseinheiten. Alle Inhalte stammen aus Markdown-Dateien, die in Ordnern strukturiert sind. Statt Kursbuchung oder Kontaktformularen steht die Lesbarkeit während des Trainings im Mittelpunkt.

## Kernideen

- **Ordner = Kategorien**: Jeder Ordner unter `stunden/` bildet eine Kategorie (z. B. Rücken, Schulter, Balance).
- **Markdown = Datenquelle**: Eine Datei entspricht exakt einer Stunde. Überschriften und Listen werden geparst und als UI-Elemente dargestellt.
- **Reader-Modus**: Große, ruhige Typografie, Fokus auf den aktuellen Übungsblock, Navigation über „Zurück“ / „Weiter“.

## Projektstruktur (Auszug)

```
RehaSport/
├── README.md                # Diese Übersicht
├── docs/                    # Entwickler-Notizen & Architektur
├── stunden/                 # Markdown-Ordner mit Stunden
│   └── <ordner>/<slug>.md   # z. B. ruecken/stabilitaet-und-mobilisation.md
└── site/                    # React-Frontend (Vite)
    ├── src/App.tsx          # Routing
    ├── src/content/         # Markdown-Parser & Info-Texte
    ├── src/pages/           # Reader-Seiten
    └── src/index.css        # Layout & Komponenten-Styling
```

## Markdown-Format einer Stunde

Pflichtstruktur einer Markdown-Datei im Ordner `stunden/`:

```markdown
---
beschreibung: Aktivierende Rücken-Einheit.
dauer: 45 Minuten
fokus: Rücken, Rumpfstabilität
---

# Rückenfit: Stabilität und Mobilisation

## Beschreibung
Kurzer Freitext zum Ziel der Stunde.

## Dauer
45 Minuten

## Fokus
Optionaler Schwerpunkt (z. B. Rücken, Schulter).

## Übungen
1. Aktivierung im Stand
   - **Beschreibung:** Kurzer Ablauftext.
   - **Dauer/Wiederholungen:** 3 Sätze à 10
   - **Equipment:** Theraband
   - **Hinweise:** Aufrichtung betonen
```

- Der Abschnitt `## Übungen` muss eine nummerierte Liste enthalten.
- Unterpunkte innerhalb der Übungen werden als Details erkannt, wenn sie mit `**Label:**` beginnen.
- Zusätzliche Labels erscheinen als freie Hinweise, die Reihenfolge bleibt erhalten.

## Reader-Navigation

1. **Startseite**: Listet alle Ordner alphabetisch mit Kurzbeschreibung und Anzahl der enthaltenen Stunden.
2. **Ordnerseite**: Zeigt alle Stunden eines Ordners mit Dauer- und Fokusangaben.
3. **Stundenseite**: Präsentiert Beschreibung, Dauer, Fokus sowie die Übungen. Über „Zurück“ und „Weiter“ lässt sich der aktive Übungsblock wechseln.

## Entwicklung

```bash
cd site
npm install            # Abhängigkeiten (einmalig)
npm run dev            # Entwicklungsserver mit Hot-Reload
npm run test           # Vitest (SSR-Rendering der Seiten)
npm run build          # Produktionsbuild erzeugen
```

Das Frontend basiert auf React + Vite. Markdown-Dateien werden über `import.meta.glob` als Rohtext geladen und mit `gray-matter` plus `remark-parse` analysiert. Änderungen an `stunden/` erfordern keinen Build-Schritt – Vite erkennt neue Dateien automatisch.

## Weitere Hinweise

- Farben, Abstände und Schriftdefinitionen liegen in `site/src/styles/theme.css`.
- Barrierefreiheit: Skip-Link, Fokuszustände und Buttons unterstützen Tastaturnavigation.
- Für neue Ordner reicht es, einen Unterordner in `stunden/` anzulegen. Dateiname = URL-Slug.
- Dokumentation zum Parser und zur Navigation befindet sich zusätzlich in `docs/reader-architektur.md`.

Viel Erfolg beim Unterrichten – und viel Freude beim Erweitern des Readers!

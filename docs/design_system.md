# Design-System

Stand: 18.02.2026

## Leitidee

Das aktuelle System folgt einem minimalistischen, zielorientierten Stil:
- klar
- eckig
- modern
- ohne dekorativen Ballast

Die zentrale Umsetzung liegt in `site/src/styles/global.css`.

## Typografie

- Headlines: `Space Grotesk`
- Body/UI: `IBM Plex Sans`
- Ziel: klare Hierarchie und schnelle Erfassbarkeit auf Mobilgeraeten

## Farbstrategie

- Basis: Schwarz/Grau/Weiss
- Einziger Akzent: Signal-Gruen (`--accent`)
- Keine zweite Akzentpalette

## Formensprache

- Radius minimal (`2px` bis `4px`)
- klare Kanten, sichtbare Borders
- keine organischen Formen

## Motion

- nur funktionale Micro-Transitions (ca. 120ms)
- keine dekorativen Animationen
- kein ambient Hintergrund

## Layout-Prinzipien

- mobile-first Basis
- Erweiterung ueber `min-width`-Breakpoints
- Komponenten:
  - `tool-bar` startet einspaltig auf Mobile
  - Grids starten mit 1 Spalte und erweitern sich erst auf groesseren Screens

## Komponentenprinzipien

- Astro fuer statische Struktur
- React nur als Inseln fuer Interaktion
- konsistente Klassen in `global.css`
- keine verstreuten pro-Seite Sonderstile ohne Not

## Accessibility und UX

- semantische Landmarken (`header`, `main`, `footer`, `nav`)
- klare Fokusstile auf Inputs
- hohe Lesbarkeit und klarer Kontrast
- rechtliche Pflichtseiten sind im Footer direkt erreichbar (ohne versteckte Navigation)

## Designregeln fuer neue Features

- neue Farben nur als CSS-Variablen im Token-Bereich einfuehren
- auf mobile-first Verhalten pruefen
- keine visuellen Effekte aufnehmen, die den Kernflow verlangsamen oder ablenken

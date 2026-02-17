# Design-System

Stand: 17.02.2026

## Leitidee

Das visuelle System folgt dem Stil "Sanfte Heilung": organisch, ruhig, klar, gut lesbar. Die Umsetzung liegt zentral in `site/src/index.css`.

## Typografie

- Display/Headlines: `Fraunces`
- Body/UI-Text: `Source Sans 3`
- Ziel: hohe Lesbarkeit bei gleichzeitig medizinisch-ruhigem Charakter

## Farbstrategie

- Primaerpalette: Sage (Gruentoene)
- Sekundaerpalette: Sand und Terracotta
- Akzentpalette: Lime fuer interaktive Hervorhebungen
- Phasenfarben:
  - Aufwaermen
  - Hauptteil
  - Schwerpunkt
  - Ausklang

Die Phasenfarben werden in Session- und Filterdarstellungen aktiv verwendet.

## Theming

- Unterstuetzte Modi: `light`, `dark`, `system`
- Steuerung durch `ThemeProvider` (`site/src/components/theme/ThemeProvider.tsx`)
- Persistenz in `localStorage` (`reader-theme-mode`)
- Root-Attribute:
  - `data-color-mode` (user choice)
  - `data-theme` (resolved light/dark)
- Adminbereich setzt Dark-Theme bewusst als Arbeitsmodus.

## Bewegung und Hintergrund

- Definierte Animations-Tokens (fade, slide, scale, blob, float)
- Globaler Ambient-Hintergrund (`AmbientBackground`) mit:
  - 3 statischen Blur-Blobs
  - reduziert auf 2 Blobs auf Mobile
  - Beruecksichtigung von `prefers-reduced-motion`

## Komponentenprinzipien

- Wiederverwendbare UI-Bausteine in `site/src/components/ui`
- Trennung von:
  - Layout-Komponenten (`components/layout`)
  - fachlichen Komponenten (`components/search`, Seitenkomponenten)
- Utility-/Token-basierte Styles statt per-Page Einzellogik

## Accessibility und UX

- Skip-Link im Hauptlayout
- semantische Landmarken (`header`, `main`, `footer`, `nav`)
- mobile Navigation mit Escape-/Backdrop-Handling
- Service Worker Update-Hinweise und Offline-Ready-Status

## Designregeln fuer neue Features

- Neue Farben nur als Tokens in `index.css` einfuehren
- keine direkten Hex-Farben in Komponenten, wenn Token verfuegbar
- Animationen dezent halten, nicht als Selbstzweck
- mobile-first denken (Touchflaechen, Menue, Scroll-Verhalten)

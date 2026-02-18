# RehaSport-Projektdokumentation

Stand: 18.02.2026

Diese Dokumentation beschreibt den aktuellen Zustand nach dem Public-Relaunch auf Astro.

## Inhalte

- [architektur.md](./architektur.md): Systemaufbau, Datenfluss, Kernmodule
- [entscheidungen_adr.md](./entscheidungen_adr.md): zentrale Architektur- und Produktentscheidungen
- [design_system.md](./design_system.md): visuelle Sprache und UI-Regeln
- [deployment_und_betrieb.md](./deployment_und_betrieb.md): Build, Deployment, Betrieb
- [entwicklungsrichtlinien.md](./entwicklungsrichtlinien.md): Arbeitsregeln fuer Entwicklung und Content

## Kurzueberblick

- Frontend: Astro + React-Inseln (Public only)
- Backend: Firebase (Firestore, Cloud Functions, Hosting)
- Datenquelle fuer Public-Seiten: Firestore (live im Client, 5-Minuten-Cache)
- URL-Map Public:
  - `/`
  - `/stunden` und `/stunden/:kategorieSlug/:stundenSlug`
  - `/uebungen` und `/uebungen/:uebungSlug`
  - `/wissen`
  - `/impressum`
  - `/datenschutz`

## Wichtiger Hinweis

Die alte React/Vite-Seite wurde entfernt. Es gibt aktuell keinen produktiven Admin-Login im Frontend.

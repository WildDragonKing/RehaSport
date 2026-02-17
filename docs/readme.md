# RehaSport-Projektdokumentation

Stand: 17.02.2026

Diese Dokumentation beschreibt die aktuelle technische Umsetzung des RehaSport-Projekts auf Basis des Codes im Repository.

## Inhalte

- [architektur.md](./architektur.md): Systemaufbau, Datenfluss, Kernmodule
- [entscheidungen_adr.md](./entscheidungen_adr.md): zentrale Architektur- und Produktentscheidungen
- [design_system.md](./design_system.md): visuelle Sprache, Themes, Komponentenregeln
- [deployment_und_betrieb.md](./deployment_und_betrieb.md): Build, Deployment, Betrieb, Monitoring
- [entwicklungsrichtlinien.md](./entwicklungsrichtlinien.md): Arbeitsregeln fuer Entwicklung und Content

## Kurzueberblick

- Frontend: React + Vite + Tailwind CSS (PWA-faehig)
- Backend: Firebase (Firestore, Auth, Cloud Functions, Hosting)
- KI-Funktionen: Gemini ueber Firebase Callable Functions
- Datenquelle: Firestore (Sessions, Exercises, Drafts, Users, Invitations, Ratings)

## Ziel der Doku

- Onboarding beschleunigen
- technische Entscheidungen nachvollziehbar machen
- Betriebs- und Releasewissen zentral verfuegbar halten

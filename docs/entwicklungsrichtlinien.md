# Entwicklungsrichtlinien

Stand: 18.02.2026

Diese Datei fasst die aktuellen Arbeitsregeln fuer die Weiterentwicklung zusammen.

## Produkt- und Inhaltsregeln

- Sprache fuer Nutzertexte: Deutsch
- Fokus des Frontends: schneller Kernflow (finden -> oeffnen -> lesen)
- Inhalte bleiben an der RehaSport-Logik orientiert (45-Minuten-Schema, sichere Alternativen)
- Rechtliche Mindestseiten (`/impressum`, `/datenschutz`) muessen im Public-Frontend verfuegbar und im Footer verlinkt sein

## Architekturregeln

- Frontend-Stack Public: Astro + React-Inseln
- Firestore ist primaere Datenquelle fuer Public-Inhalte
- Datenzugriff zentral in `site/src/lib/content.ts`
- Typen zentral in `site/src/lib/types.ts`

## Frontend-Standards

- mobile-first entwickeln
- interaktive Logik in React-Inseln halten, nicht in Astro-Seiten verteilen
- Designtoken in `site/src/styles/global.css` nutzen
- nur einen Akzentton verwenden (Signal-Gruen)
- keine dekorativen Animationen, kein visueller Ballast

## Firestore- und Env-Regeln

- neue Firestore-Felder nur mit Typanpassung in `types.ts`
- Normalisierung/Mapping in `content.ts` aktualisieren
- noetige Client-Variablen als `PUBLIC_*` bereitstellen
- keine Secrets in den Clientcode

## Tests und lokale Checks

Vor PR/Release im Frontend immer ausfuehren:

```bash
cd site
npm run typecheck
npm test
npm run build
```

## Deployment-Disziplin

- `main` ist Release-Zweig (auto deploy ueber Workflow)
- kleine, reviewbare PRs
- bei Routingaenderungen immer `firebase.json` mitziehen

## Doku-Disziplin

Bei Architektur-/UI-Aenderungen aktualisieren:
- `docs/architektur.md`
- `docs/design_system.md`
- `docs/entscheidungen_adr.md`
- `docs/deployment_und_betrieb.md`

# AGENTS

## Projektstatus (verbindlich)

- Frontend unter `site/` ist Astro-basiert.
- Der vorherige React/Vite-Frontend-Stand wurde entfernt.
- Es gibt aktuell kein produktives Admin-Frontend im Repository.
- Public-Daten werden live aus Firestore geladen.

## Technischer Rahmen

- Public-Routen:
  - `/`
  - `/stunden` und `/stunden/:kategorieSlug/:stundenSlug`
  - `/uebungen` und `/uebungen/:uebungSlug`
  - `/wissen`
  - `/impressum`, `/datenschutz`
- Statische Struktur: Astro-Seiten in `site/src/pages`
- Interaktive Teile: React-Inseln in `site/src/components/react`
  - `SessionsExplorer.tsx` - Stunden-Liste und Detail
  - `ExercisesExplorer.tsx` - Uebungs-Liste und Detail
- Datenlayer: `site/src/lib/content.ts`
- Firebase-Init: `site/src/lib/firebase.ts`
- Cloud Functions: `functions/src/index.ts` (Gemini, Rate Limiting, Input-Sanitization)

## Security

- Firestore Rules (`firestore.rules`): exists()-Guard, affectedKeys(), Schema-Validierung, Fail-Closed
- Cloud Functions: requireTrainerRole(), sanitizeTextInput(), Fail-Closed Rate Limiting
- HTTP Headers (`firebase.json`): CSP, X-Frame-Options, X-Content-Type-Options

## Design- und UX-Regeln

- mobile-first umsetzen
- minimalistischer, eckiger Stil
- monochrome Basis + ein Akzentton (Signal-Gruen)
- keine dekorativen Animationen
- keine Theme-Umschaltung im Public-Frontend
- Accessibility: aria-labels auf interaktive Elemente (Accordions, Buttons)

## Build, Tests, Checks

Immer im Ordner `site/` ausfuehren:

```bash
npm run typecheck
npm test
npm run build
```

Cloud Functions Build:

```bash
cd functions
npm run build
```

## Env-Konvention

Primaere Variablennamen:
- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- optional `PUBLIC_FIREBASE_MEASUREMENT_ID`

Hinweis: `VITE_*` wird aktuell im Code als Fallback akzeptiert.

## Deployment-Hinweise

- Hosting-Ziel bleibt `site/dist`.
- Rewrites fuer Detailpfade liegen in `firebase.json`.
- CI-Workflow: `.github/workflows/release.yml` (deployed nur Hosting + erstellt Tag).
- Cloud Functions und Firestore Rules muessen manuell deployed werden:
  - `npx firebase deploy --only functions`
  - `npx firebase deploy --only firestore:rules`

## Dokumentation pflegen

Bei Architektur- oder Flow-Aenderungen immer mit aktualisieren:
- `docs/architektur.md`
- `docs/design_system.md`
- `docs/deployment_und_betrieb.md`
- `docs/entscheidungen_adr.md`
- `docs/entwicklungsrichtlinien.md`

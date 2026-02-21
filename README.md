# RehaSport

RehaSport ist ein Public-Frontend fuer Rehasport-Stunden und Uebungen.
Die Inhalte werden live aus Firestore geladen.

## Projektstatus
- Frontend unter `site/` ist Astro-basiert (React-Inseln fuer Interaktion).
- Cloud Functions unter `functions/` (Gemini KI-Integration, Rate Limiting).
- Es gibt aktuell kein produktives Admin-Frontend im Repository.

## Public-Routen
- `/` - Startseite
- `/stunden` und `/stunden/:kategorieSlug/:stundenSlug`
- `/uebungen` und `/uebungen/:uebungSlug`
- `/wissen`
- `/impressum`, `/datenschutz`

## Technischer Rahmen
- Astro-Seiten: `site/src/pages`
- React-Inseln: `site/src/components/react`
- Datenlayer: `site/src/lib/content.ts`
- Firebase-Init: `site/src/lib/firebase.ts`
- Cloud Functions: `functions/src/index.ts`
- Security Rules: `firestore.rules`
- Hosting Config: `firebase.json` (inkl. Security Headers)

## Entwicklung
```bash
cd site
npm install
npm run dev
```

## Verbindliche Checks
Frontend (in `site/`):
```bash
npm run typecheck
npm test
npm run build
```

Cloud Functions (in `functions/`):
```bash
npm run build
```

## Deployment
- CI-Workflow: `.github/workflows/release.yml` (Push auf `main` = auto-deploy Hosting + Tag)
- Manuell nach Release: `npx firebase deploy --only functions,firestore:rules`

## Env-Konvention
- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- optional `PUBLIC_FIREBASE_MEASUREMENT_ID`

Hinweis: `VITE_*` wird im Code weiterhin als Fallback akzeptiert.

## Dokumentation
- Architektur: `docs/architektur.md`
- Design-System: `docs/design_system.md`
- Betrieb: `docs/deployment_und_betrieb.md`
- Entscheidungen: `docs/entscheidungen_adr.md`
- Richtlinien: `docs/entwicklungsrichtlinien.md`

# Deployment und Betrieb

Stand: 17.02.2026

## Zielumgebung

- Firebase Projekt: `rehasport-trainer`
- Hosting: Firebase Hosting (`site/dist`)
- Firestore: `(default)` Datenbank, Standort `nam5`
- Functions: Node 20, Region `europe-west1`

## Lokale Entwicklung

## Frontend

```bash
cd site
npm ci
npm run dev
```

## Typecheck und Tests

```bash
cd site
npm run typecheck
npm test
```

## Functions

```bash
cd functions
npm ci
npm run build
```

## Build und Deployment

## Hosting Build

```bash
cd site
npm run build
```

## Manuelles Firebase Deploy

```bash
npx firebase deploy
```

Hinweis: Das Projekt nutzt `npx firebase`, da die CLI nicht global vorausgesetzt wird.

## CI/CD Workflow

Datei: `.github/workflows/release.yml`

Trigger:
- Push auf `main`

Pipeline:
1. Checkout
2. Node Setup
3. `npm ci` in `site`
4. Tests in `site`
5. Firebase CLI Setup
6. Firebase Web SDK Config aus Projekt ziehen
7. Frontend Build
8. Deploy zu Firebase Hosting (`channelId: live`)
9. Auto-Versionstag und GitHub Release

## Konfigurationswerte und Secrets

Frontend erwartet (siehe `site/.env.example`):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- optional `VITE_RECAPTCHA_V3_SITE_KEY`

Cloud Functions:
- Secret `GEMINI_API_KEY`

## Monitoring und Fehlerbehandlung

- Clientfehler gehen ueber Callable `logClientError` in Google Cloud Logging.
- Frontend setzt globale Handler fuer:
  - `window.onerror`
  - `window.onunhandledrejection`
- Analytics:
  - Firebase Analytics (Client)
  - zusaetzliche Nutzungsmetriken in Firestore (`analytics` Collection)

## Betriebsnahe Admin-Funktionen

- Export aller zentralen Collections als ZIP (`site/src/firebase/export.ts`)
- Bulk-Generierung ueber Hintergrundjobs (`generationJobs`)
- Session-Regeln konfigurierbar ueber `config/sessionRules`

## Sicherheitsrelevante Betriebsregeln

- Firestore Rules sind verpflichtend und Teil des Deployments.
- AI-Endpoints erzwingen App Check und Auth.
- Rollen und Berechtigungen werden nicht nur im UI, sondern in Rules kontrolliert.

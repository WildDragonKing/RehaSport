# Deployment und Betrieb

Stand: 21.02.2026

## Zielumgebung

- Firebase Projekt: `rehasport-trainer`
- Hosting: Firebase Hosting (`site/dist`)
- Firestore: `(default)` Datenbank, Standort `nam5`
- Functions: Node 20, Region `europe-west1`

## Lokale Entwicklung

### Frontend (Astro)

```bash
cd site
npm ci
npm run dev
```

Standard-URL lokal: `http://localhost:4321/` (Port kann ueberschrieben werden).

### Typecheck, Tests, Build

```bash
cd site
npm run typecheck
npm test
npm run build
```

### Cloud Functions

```bash
cd functions
npm ci
npm run build
```

## Umgebungsvariablen

Frontend erwartet (siehe `site/.env.example`):
- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- optional `PUBLIC_FIREBASE_MEASUREMENT_ID`

Hinweis: Aus Kompatibilitaetsgruenden akzeptiert der Code auch `VITE_*`-Namen als Fallback.

## Build und Deployment

### Hosting Build

```bash
cd site
npm run build
```

### Manuelles Firebase Deploy

```bash
# Alles deployen
npx firebase deploy

# Nur einzelne Komponenten
npx firebase deploy --only hosting
npx firebase deploy --only functions
npx firebase deploy --only firestore:rules
```

## Firebase Hosting Routing

`firebase.json` verwendet gezielte rewrites fuer dynamische Public-Unterpfade:
- `/stunden` und `/stunden/**` -> `/stunden/index.html`
- `/uebungen` und `/uebungen/**` -> `/uebungen/index.html`

Damit funktionieren clientseitige Detailpfade ohne Catch-all-SPA-Rewrite.

Statische Rechtsseiten (`/impressum`, `/datenschutz`) werden ohne zusaetzliche rewrites direkt aus `site/dist` bedient.

## HTTP Security Headers

In `firebase.json` sind folgende Headers fuer alle Routen konfiguriert:
- `X-Frame-Options: DENY` - Clickjacking-Schutz
- `X-Content-Type-Options: nosniff` - MIME-Sniffing verhindern
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` mit Whitelist fuer Firebase/Google APIs

## CI/CD Workflow

Datei: `.github/workflows/release.yml`

Trigger:
- Push auf `main`

Pipeline:
1. Checkout
2. Node Setup
3. `npm ci` in `site`
4. `npm test` in `site`
5. Firebase CLI Setup
6. Firebase Web SDK Config aus Projekt ziehen
7. Frontend Build mit `PUBLIC_FIREBASE_*`-Variablen
8. Deploy zu Firebase Hosting (`channelId: live`)
9. Auto-Versionstag und GitHub Release

**Wichtig:** Der CI-Workflow deployed nur Firebase Hosting. Cloud Functions und Firestore Rules muessen nach einem Release manuell deployed werden:

```bash
npx firebase deploy --only functions
npx firebase deploy --only firestore:rules
```

## Monitoring und Betriebshinweise

- Der aktuelle Public-Frontend-Stand hat keine PWA-/Service-Worker-Logik.
- Firestore Rules und Cloud Functions bleiben Teil der Gesamtplattform und werden ueber das Root-Projekt verwaltet.
- Cloud Functions nutzen Fail-Closed Rate Limiting - bei Fehlern wird Zugriff verweigert.

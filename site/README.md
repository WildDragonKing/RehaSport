# RehaSport Public (Astro)

Minimalistisches Public-Frontend fuer RehaSport mit Live-Daten aus Firestore.

## Routes
- `/`
- `/stunden` und `/stunden/:kategorieSlug/:stundenSlug`
- `/uebungen` und `/uebungen/:uebungSlug`
- `/wissen`
- `/impressum`
- `/datenschutz`

## Stack
- Astro
- React-Inseln
- Firebase Firestore (Client-seitig)

## Entwicklung
```bash
cd site
npm install
npm run dev
```

## Checks
```bash
cd site
npm run typecheck
npm test
npm run build
```

## Env
Primaer genutzt:
- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- optional `PUBLIC_FIREBASE_MEASUREMENT_ID`

Fallback:
- `VITE_*` Variablen werden weiterhin akzeptiert.

## Deployment
- Build-Output: `site/dist`
- Hosting/Rewrites: `../firebase.json`

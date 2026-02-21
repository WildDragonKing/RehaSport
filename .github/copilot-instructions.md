# Copilot-Anweisungen fuer das RehaSport-Projekt

## Projektuebersicht

RehaSport ist ein Public-Frontend fuer Rehabilitationssport-Stunden und Uebungen. Die Inhalte werden live aus Firestore geladen und ueber Firebase Hosting ausgeliefert.

**Projektsprache**: Deutsch (alle Inhalte, Dateinamen und Dokumentation)

**Synchronisationspflicht**: Aenderungen an diesen Copilot-Anweisungen, an `AGENTS.md` oder an `CLAUDE.md` muessen immer miteinander abgestimmt und im selben Commit vorgenommen werden.

## Architektur & Stack

### Frontend (site/)
- **Framework:** Astro mit React-Inseln
- **Datenquelle:** Firestore (Client-seitig, live)
- **Styling:** CSS Design-Tokens in `site/src/styles/global.css`
- **Build:** `cd site && npm run build` (Output: `site/dist`)

### Backend (functions/)
- **Cloud Functions v2** (Node 20, Region `europe-west1`)
- **KI-Integration:** Google Gemini fuer Stunden-/Uebungs-Generierung
- **Security:** Rollen-Checks, Input-Sanitization, Rate Limiting

### Infrastruktur
- **Hosting:** Firebase Hosting
- **Datenbank:** Firestore
- **Auth:** Firebase Auth mit Google SSO
- **Projekt-ID:** `rehasport-trainer`

## Verzeichnisstruktur

```
/
├── firebase.json              - Hosting, Functions, Firestore Config
├── firestore.rules            - Firestore Security Rules
├── functions/src/index.ts     - Cloud Functions
├── site/src/
│   ├── components/react/      - SessionsExplorer, ExercisesExplorer
│   ├── layouts/               - BaseLayout.astro
│   ├── lib/                   - content.ts, firebase.ts, types.ts
│   ├── pages/                 - Astro-Seiten
│   └── styles/                - global.css
├── docs/                      - Projektdokumentation
└── .github/workflows/         - CI/CD (release.yml)
```

## Public-Routen

- `/` - Startseite
- `/stunden` - Stundenliste mit Suche
- `/stunden/:kategorieSlug/:stundenSlug` - Stundendetail
- `/uebungen` - Uebungsliste mit Suche
- `/uebungen/:uebungSlug` - Uebungsdetail
- `/wissen` - Wissensseite
- `/impressum`, `/datenschutz` - Rechtliche Pflichtseiten

## Medizinische Anforderungen

### 45-Minuten-Schema (verbindlich)

| Phase | Dauer | Zweck |
|-------|-------|-------|
| Aufwaermen | 10 Min | Aktivierung, Mobilisation |
| Hauptteil | 15 Min | Kraft, Ausdauer |
| Schwerpunkt | 15 Min | Themenspezifische Vertiefung |
| Ausklang | 5 Min | Cool-down, Dehnung |

### Pflicht-Alternativen
- Jede Uebung muss Alternativen fuer Knieprobleme und Schulterprobleme bieten
- Kontraindikationen sind Pflicht und duerfen nie leer bleiben
- "Im Zweifel konservativ" - Sicherheit vor Intensitaet

## Design-Regeln

- mobile-first (Pflicht-Referenz: 320px Breite)
- minimalistischer, eckiger Stil
- monochrome Basis + Signal-Gruen als einziger Akzent
- keine dekorativen Animationen
- Accessibility: aria-labels auf interaktive Elemente

## Entwicklungs-Commands

```bash
# Frontend
cd site
npm run typecheck    # TypeScript-Pruefung
npm test             # Vitest Tests
npm run build        # Astro Produktions-Build
npm run dev          # Dev-Server (Port 4321)

# Cloud Functions
cd functions
npm run build        # TypeScript Build
```

## Deployment

- CI-Workflow `.github/workflows/release.yml` deployed bei Push auf `main`
- CI deployed nur Hosting + erstellt Git-Tag/GitHub-Release
- Cloud Functions: `npx firebase deploy --only functions`
- Firestore Rules: `npx firebase deploy --only firestore:rules`

## Security-Patterns

- Firestore Rules: exists()-Guard vor get(), affectedKeys() fuer Privilege Escalation
- Cloud Functions: requireTrainerRole(), sanitizeTextInput(), Fail-Closed Rate Limiting
- HTTP Headers: CSP, X-Frame-Options, X-Content-Type-Options in firebase.json

## Env-Konvention

- `PUBLIC_FIREBASE_API_KEY`
- `PUBLIC_FIREBASE_AUTH_DOMAIN`
- `PUBLIC_FIREBASE_PROJECT_ID`
- `PUBLIC_FIREBASE_STORAGE_BUCKET`
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `PUBLIC_FIREBASE_APP_ID`
- optional `PUBLIC_FIREBASE_MEASUREMENT_ID`
- Fallback: `VITE_*` Variablen werden im Code akzeptiert

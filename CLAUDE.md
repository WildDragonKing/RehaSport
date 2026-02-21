# Claude-Anweisungen fuer das RehaSport-Projekt

## Synchronisation & Dokumentationspflege
- Aenderungen an diesem Dokument, an `AGENTS.md` und an `.github/copilot-instructions.md` muessen immer gemeinsam geprueft und synchronisiert werden.
- Fuehre notwendige Anpassungen in allen drei Dokumenten im selben Commit durch, damit keine widerspruechlichen Regeln entstehen.
- Halte die Projektdokumentation konsolidiert, entferne redundante Passagen und verzichte auf das Anlegen unnoetiger zusaetzlicher Markdown-Dateien.

## Kernleitplanken
- Alle Inhalte werden auf Deutsch verfasst; Dateinamen nutzen Kleinbuchstaben und Unterstriche.
- Trainingsstunden folgen strikt dem 45-Minuten-Schema (10 Min Aufwaermen, 15 Min Hauptteil, 15 Min Schwerpunkt, 5 Min Ausklang).
- Jede Uebung dokumentiert Alternativen fuer Knie- und Schulterbeschwerden sowie vollstaendige Kontraindikationen.

## Kommunikationsstil
- Bleibe fachlich praezise, empathisch und sicherheitsorientiert ("Im Zweifel konservativ").
- Hebe bei Empfehlungen stets die medizinische Sicherheit, Barrierefreiheit und klare Alternativen hervor.

## Firebase-Architektur (Stand: Februar 2026)

### Projekt-Setup
- **Projekt-ID:** `rehasport-trainer`
- **Hosting:** Firebase Hosting (Public-Frontend)
- **Datenbank:** Firestore (einzige Datenquelle)
- **Auth:** Firebase Auth mit Google SSO
- **Functions:** Cloud Functions v2 (Node 20, Region `europe-west1`)

### Benutzerrollen & Einladungssystem
- **Admin:** Vollzugriff, kann Trainer einladen, Entwuerfe freigeben
- **Trainer:** Nur mit Einladung registrierbar, eigene Stunden/Gruppen verwalten
- **Teilnehmer:** Oeffentlicher Zugang ohne Login (Stunden ansehen, Bewertungen abgeben)
- Erster User wird automatisch Admin
- Trainer-Einladungen ueber `/admin/trainer` (nur Admin)

### Firestore Collections
```
firestore/
├── sessions/{sessionId}       - Trainingsstunden (status: draft|published)
├── exercises/{exerciseId}     - Uebungsbibliothek
├── groups/{groupId}           - Trainingsgruppen mit Einschraenkungen
├── drafts/{draftId}           - KI-generierte Entwuerfe
├── users/{userId}             - Benutzerprofile (role: admin|trainer)
├── ratings/{ratingId}         - Aggregierte Bewertungen (totalRatings, sumRatings)
├── analytics/{docId}          - Event-Tracking (nur Auth-User, append-only)
├── invitations/{id}           - Trainer-Einladungen
├── config/{configId}          - App-Konfiguration (nur Admin)
├── rateLimits/{userId}        - KI-Rate-Limits (nur Server via Admin SDK)
└── generationJobs/{jobId}     - KI-Generierungs-Jobs (nur Server via Admin SDK)
```

### Verzeichnisstruktur
```
/                              - Projekt-Root
├── firebase.json              - Firebase Hosting/Functions/Firestore Config
├── firestore.rules            - Firestore Security Rules
├── functions/
│   └── src/index.ts           - Cloud Functions (Gemini, Rate Limiting)
├── site/
│   └── src/
│       ├── components/react/  - React-Inseln (SessionsExplorer, ExercisesExplorer)
│       ├── layouts/           - Astro Base-Layout
│       ├── lib/               - content.ts, firebase.ts, types.ts
│       ├── pages/             - Astro-Seiten (Public-Routen)
│       └── styles/            - global.css (Design-Tokens)
├── docs/                      - Projektdokumentation
└── .claude/                   - Claude Code Automationen
```

### Security-Patterns

#### Firestore Rules
- **exists() vor get():** `userExists()` Guard verhindert Fehler bei fehlenden User-Dokumenten
- **Privilege Escalation:** User kann eigene `role` nicht aendern (`affectedKeys()` Check)
- **Schema-Validierung:** Ratings und Analytics haben `keys().hasOnly()` + Typ-Checks bei `create`
- **Fail-Closed:** `rateLimits` und `generationJobs` sind `allow read, write: if false` (nur Admin SDK)
- **Trainer-Ownership:** Trainer koennen nur eigene Ressourcen bearbeiten (`createdBy == request.auth.uid`)

#### Cloud Functions
- **requireTrainerRole():** Zentraler Helper prueft Auth + Firestore-Rolle vor jeder KI-Operation
- **sanitizeTextInput():** Laengenbegrenzung und Trimming fuer alle User-Eingaben
- **Fail-Closed Rate Limiting:** Bei Rate-Limit-Fehler wird Zugriff verweigert (nicht erlaubt)
- **Input-Sanitization:** Prompt Injection Schutz durch Laengenlimits (topic: 200, prompt: 500)

#### HTTP Security Headers (firebase.json)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `Content-Security-Policy` mit Whitelist fuer Firebase/Google APIs

### Entwicklungs-Commands
- `cd site && npm run dev` - Astro Dev-Server (Port 4321)
- `cd site && npm run build` - Astro Build fuer Produktion
- `cd site && npm run typecheck` - TypeScript-Pruefung
- `cd site && npm test` - Vitest Tests
- `cd functions && npm run build` - TypeScript Build fuer Cloud Functions
- `npx firebase deploy` - Alles deployen (Hosting + Functions + Rules)
- `npx firebase deploy --only hosting` - Nur Hosting
- `npx firebase deploy --only functions` - Nur Cloud Functions
- `npx firebase deploy --only firestore:rules` - Nur Firestore Rules

### Git Workflow
- **Branch Protection:** Direct push zu `main` nicht moeglich - immer PR erstellen
- **Release:** Feature-Branch -> PR -> Merge zu `main` (CI deployed automatisch Site + erstellt Tag)
- **Manuell nach Release:** `npx firebase deploy --only functions,firestore:rules` (CI deployed nur Hosting)

### Cloud Functions (functions/src/index.ts)
- **Region:** `europe-west1` fuer alle Functions
- **Gemini Modell:** `gemini-3-flash-preview` (Fallback: `gemini-2.5-flash`)
- **Rate Limiting:** Firestore Transactions mit Fail-Closed Pattern
- **TypeScript Pattern:** Bei Firestore-Docs `{ ...data, id: doc.id }` statt `{ id, ...data }` um Duplikat-Fehler zu vermeiden
- **Rollen-Check:** `requireTrainerRole()` als zentraler Guard fuer alle KI-Endpoints

### UI-Patterns (Public-Frontend)
- **Design:** Minimalistisch, eckig, monochrom + Signal-Gruen Akzent
- **Typografie:** Space Grotesk (Headlines) + IBM Plex Sans (Body)
- **Mobile-first:** Breakpoint bei `720px`, Pflicht-Referenz `320px` Breite
- **Accordion:** Native `<details>`/`<summary>` fuer Phasen-Details, mit `aria-label`
- **CSS:** Design-Tokens in `site/src/styles/global.css`, keine verstreuten Sonderstile

### Offene Features
- [x] KI-Stunden-Builder mit Google Gemini
- [x] Bulk-Generator fuer Uebungen und Stunden
- [x] Astro-Migration (Public-Frontend)
- [x] Security Hardening (Firestore Rules, Cloud Functions, HTTP Headers)
- [x] Claude Code Automationen (Hooks, Skills, Agents)
- [ ] Teilnehmer-Modus (Timer, Swipe-Navigation)
- [ ] Domain rehasport.buettgen.app (manuell in Firebase Console)

## Claude Code Automationen (.claude/)

### Hooks (settings.json)
- **Auto-Format:** Prettier nach Edit/Write fuer site/
- **TypeScript Check:** tsc --noEmit nach .ts/.tsx Aenderungen
- **Test Runner:** Vitest fuer .test.ts/.test.tsx Dateien
- **Gotcha:** `matcher` muss ein Regex-String sein, kein Objekt
- **Gotcha:** Prettier formatiert CSS nach Edit - vor erneutem Edit immer Read ausfuehren

### Testing Patterns
- **Vitest Hoisting:** Mock-Daten muessen INNERHALB der `vi.mock()` Factory definiert werden
- **ContentProvider Tests:** `renderHook()` mit `wrapper: ContentProvider` fuer Context-Hooks
- **IntersectionObserver:** Mock bereits in `test/setup.ts` fuer useScrollReveal

### Dev Server (.claude/launch.json)
- `astro-dev` - Astro Frontend Dev-Server (`cd site && npx astro dev`, Port 4321)

### Skills (.claude/skills/)
- `/deploy` - Build + Firebase Deploy (site + functions)
- `/new-admin-page` - Admin-Seite mit Dark Mode Template

### Agents (.claude/agents/)
- `security-reviewer` - Sicherheitsanalyse fuer Firebase Rules und Auth
- `content-reviewer` - Therapeutische Vollstaendigkeit (Alternativen, Kontraindikationen)

### MCP Server (.mcp.json)
- Firebase MCP fuer Team-Sharing (wird automatisch geladen)

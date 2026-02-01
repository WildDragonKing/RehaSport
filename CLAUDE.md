# Claude-Anweisungen für das RehaSport-Projekt

## Synchronisation & Dokumentationspflege
- Änderungen an diesem Dokument, an `AGENTS.md` und an `.github/copilot-instructions.md` müssen immer gemeinsam geprüft und synchronisiert werden.
- Führe notwendige Anpassungen in allen drei Dokumenten im selben Commit durch, damit keine widersprüchlichen Regeln entstehen.
- Halte die Projektdokumentation konsolidiert, entferne redundante Passagen und verzichte auf das Anlegen unnötiger zusätzlicher Markdown-Dateien.

## Kernleitplanken
- Alle Inhalte werden auf Deutsch verfasst; Dateinamen nutzen Kleinbuchstaben und Unterstriche.
- Trainingsstunden folgen strikt dem 45-Minuten-Schema (10 Min Aufwärmen, 15 Min Hauptteil, 15 Min Schwerpunkt, 5 Min Ausklang).
- Jede Übung dokumentiert Alternativen für Knie- (`🦵`) und Schulterbeschwerden (`💪`) sowie vollständige Kontraindikationen.

## Kommunikationsstil
- Bleibe fachlich präzise, empathisch und sicherheitsorientiert („Im Zweifel konservativ").
- Hebe bei Empfehlungen stets die medizinische Sicherheit, Barrierefreiheit und klare Alternativen hervor.

## Firebase-Architektur (Stand: Januar 2026)

### Projekt-Setup
- **Projekt-ID:** `rehasport-trainer`
- **Hosting:** Firebase Hosting
- **Datenbank:** Firestore (einzige Datenquelle)
- **Auth:** Firebase Auth mit Google SSO
- **MCP:** Firebase MCP-Server für Deployment (`firebase_init`, `firebase_get_security_rules`)

### Benutzerrollen & Einladungssystem
- **Admin:** Vollzugriff, kann Trainer einladen, Entwürfe freigeben
- **Trainer:** Nur mit Einladung registrierbar, eigene Stunden/Gruppen verwalten
- **Teilnehmer:** Öffentlicher Zugang ohne Login (Stunden ansehen, Bewertungen abgeben)
- Erster User wird automatisch Admin
- Trainer-Einladungen über `/admin/trainer` (nur Admin)

### Firestore Collections
```
firestore/
├── sessions/{sessionId}     - Trainingsstunden (status: draft|published)
├── exercises/{exerciseId}   - Übungsbibliothek
├── groups/{groupId}         - Trainingsgruppen mit Einschränkungen
├── drafts/{draftId}         - KI-generierte Entwürfe
├── users/{userId}           - Benutzerprofile (role: admin|trainer)
├── ratings/{ratingId}       - Aggregierte Bewertungen (totalRatings, sumRatings)
├── invitations/{id}         - Trainer-Einladungen
└── config/{configId}        - App-Konfiguration
```

### Bewertungssystem
- Aggregierte Bewertungen: ein Dokument pro Session/Übung
- Felder: `totalRatings`, `sumRatings`, `averageRating`
- Eigene Bewertung wird in localStorage gespeichert
- Öffentlich ohne Login nutzbar

### Verzeichnisstruktur
```
site/
├── src/
│   ├── firebase/        - Firebase Config, Auth, Migration
│   ├── contexts/        - AuthContext, ContentContext
│   ├── hooks/           - useRatings (aggregiert)
│   ├── pages/admin/     - Admin-Bereich (Dashboard, Trainer, Export)
│   └── content/         - Firestore-Loader (sessions-firestore, exercises-firestore)
├── firebase.json        - Firebase-Konfiguration
└── firestore.rules      - Sicherheitsregeln
```

### MCP-Server Nutzung
Für Firebase-Operationen den MCP-Server verwenden:
- `firebase_get_environment` - Projekt-Status prüfen
- `firebase_init` - Features initialisieren und Regeln deployen
- `firebase_get_security_rules` - Aktuelle Regeln abrufen
- `firebase_list_projects` - Verfügbare Projekte

### Entwicklungs-Commands
- `npx firebase deploy` - Firebase CLI nicht global installiert, immer npx nutzen
- `cd site && npm run build` - Vite Build für Frontend
- `cd functions && npm run build` - TypeScript Build für Cloud Functions

### Cloud Functions (functions/src/index.ts)
- **Region:** `europe-west1` für alle Functions
- **Gemini Modell:** `gemini-3-flash-preview` (Fallback: `gemini-2.5-flash`)
- **Rate Limiting:** Firestore Transactions nutzen um Race Conditions zu vermeiden
- **TypeScript Pattern:** Bei Firestore-Docs `{ ...data, id: doc.id }` statt `{ id, ...data }` um Duplikat-Fehler zu vermeiden

### UI-Patterns
- **Dark Mode:** Tailwind `dark:` Varianten für alle Admin-Komponenten (z.B. `bg-white dark:bg-gray-800`)
- **Farben:** Sage-Palette (Erdtöne) + Lime-Akzente für interaktive Elemente
- **Animationen:** CSS-Klassen in index.css: `animate-fade-in`, `card-hover`, `btn-lime`

### Offene Features
- [x] KI-Stunden-Builder mit Google Gemini
- [x] Bulk-Generator für Übungen und Stunden
- [x] Dark Mode für Admin-Bereich
- [x] Error Logging mit Google Cloud Logging
- [x] Claude Code Automationen (Hooks, Skills, Agents)
- [x] PWA-Optimierung (Icons, Manifest, Offline-Cache)
- [ ] Teilnehmer-Modus (Timer, Swipe-Navigation)
- [ ] Domain rehasport.buettgen.app (manuell in Firebase Console)

## Claude Code Automationen (.claude/)

### Hooks (settings.json)
- **Auto-Format:** Prettier nach Edit/Write für site/
- **TypeScript Check:** tsc --noEmit nach .ts/.tsx Änderungen
- **Test Runner:** Vitest für .test.ts/.test.tsx Dateien
- **Content Validation:** validate-content.js für Übungen/*.md und stunden/*.md
- **Gotcha:** `matcher` muss ein Regex-String sein, kein Objekt

### Skills (.claude/skills/)
- `/deploy` - Build + Firebase Deploy (site + functions)
- `/new-admin-page` - Admin-Seite mit Dark Mode Template
- `/new-exercise` - Neue Übung mit Knie-/Schulter-Alternativen Template
- `/validate` - Content-Validierung für Übungen und Stunden

### Agents (.claude/agents/)
- `security-reviewer` - Sicherheitsanalyse für Firebase Rules und Auth
- `content-reviewer` - Therapeutische Vollständigkeit (Alternativen, Kontraindikationen)

### MCP Server (.mcp.json)
- Firebase MCP für Team-Sharing (wird automatisch geladen)

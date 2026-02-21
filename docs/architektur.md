# Architektur

Stand: 21.02.2026

## Systemkontext

```mermaid
flowchart LR
  U["Teilnehmer"] --> W["Public Web-App (Astro + React-Inseln)"]
  W --> H["Firebase Hosting"]
  W --> F["Firestore"]
  T["Trainer/Admin"] --> C["Cloud Functions"]
  C --> G["Gemini API"]
  C --> F
```

## Schichtenmodell

### 1) Presentation Layer (`site/src/pages`, `site/src/layouts`)
- Astro-Seiten als statische Shells
- Navigations- und Basislayout in `site/src/layouts/BaseLayout.astro`
- Public-Routen sind deutschsprachig und sprechend
- Rechtliche Pflichtseiten sind statisch als Astro-Seiten umgesetzt (`/impressum`, `/datenschutz`)

### 2) Interactive Islands (`site/src/components/react`)
- `SessionsExplorer.tsx` - Stunden-Liste mit Suche + Phasen-Accordion im Detail
- `ExercisesExplorer.tsx` - Uebungs-Liste mit Suche + Detailansicht
- Aufgabe: Such-/Filterlogik und Detaildarstellung auf Basis des URL-Pfads

### 3) Data Layer (`site/src/lib`)
- `firebase.ts`: Firebase-App/Firestore-Initialisierung
- `content.ts`: Laden und Normalisieren von Stunden und Uebungen
- In-Memory-Cache mit TTL von 5 Minuten
- Typvertrag in `types.ts`

### 4) Backend Layer (`functions/src/index.ts`)
- Cloud Functions v2 (Node 20, Region `europe-west1`)
- KI-Integration: Google Gemini fuer Stunden-/Uebungs-Generierung
- Rollen-Checks via `requireTrainerRole()` fuer alle KI-Endpoints
- Input-Sanitization via `sanitizeTextInput()` mit Laengenlimits
- Fail-Closed Rate Limiting mit Firestore Transactions

### 5) Security Layer
- **Firestore Rules** (`firestore.rules`):
  - `exists()` Guard vor `get()` verhindert Fehler bei fehlenden User-Dokumenten
  - `affectedKeys()` verhindert Privilege Escalation (User kann eigene Rolle nicht aendern)
  - Schema-Validierung bei Ratings und Analytics (`keys().hasOnly()`, Typ-Checks)
  - Server-only Collections (`rateLimits`, `generationJobs`) mit `allow read, write: if false`
- **HTTP Security Headers** (`firebase.json`):
  - CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy

## Kernprozesse

### Oeffentliche Inhalte laden
1. Astro rendert die statische Seitenhuelle.
2. React-Insel laedt Daten aus Firestore (`sessions`, `exercises`).
3. Daten werden normalisiert und 5 Minuten gecacht.
4. Suche/Filter laufen clientseitig auf dem geladenen Datensatz.

### Detailseiten
- `/stunden/:kategorieSlug/:stundenSlug`, `/uebungen/:uebungSlug`
- Firebase Hosting rewrites leiten dynamische Unterpfade auf die jeweilige Index-Seite.
- Die jeweilige Insel liest den Pfad und zeigt den passenden Detailinhalt an.
- Fuer `Stunden` bleibt die Query-Variante (`/stunden?cat=...&slug=...`) aus Kompatibilitaetsgruenden zulaessig.
- Mobile Darstellung in `Stunden`-Details nutzt ein Phasen-Accordion (erste Phase offen, weitere geschlossen).

### Statische Rechtsseiten
- `/impressum`, `/datenschutz`
- Werden ohne Client-Logik direkt als statische Astro-Seiten ausgeliefert.

## Datenmodell (genutzt im Public-Frontend)

- `sessions`: veroeffentlichte Stunden (`status == published`)
- `exercises`: Uebungsbibliothek

## Nicht mehr Teil der aktuellen Frontend-Architektur

- React Router SPA fuer Public
- PWA/Service Worker im Public-Frontend
- Theme-Switch und Ratings im Public-Frontend
- Admin-Frontend (entfernt, muss in Folgephase neu aufgebaut werden)

# Architekturentscheidungen (ADR)

Stand: 17.02.2026

## ADR-001: Firestore als zentrale Datenquelle

- Status: akzeptiert
- Kontext: Das Projekt lief historisch mit Markdown-Inhalten, benoetigt jetzt Mehrbenutzerbetrieb, Rollen und Live-Updates.
- Entscheidung: Sessions, Exercises, Drafts und Admin-Daten liegen in Firestore.
- Konsequenzen:
  - + zentrale, abfragbare Datenbasis
  - + gute Integration mit Firebase Rules/Auth
  - - Datenmigration und Typkonsistenz (Timestamp vs Number) muessen sauber gepflegt werden

## ADR-002: Einladungspflicht fuer neue Trainer/Admins

- Status: akzeptiert
- Kontext: Adminbereich darf nicht oeffentlich registrierbar sein.
- Entscheidung:
  - erster User wird automatisch Admin
  - danach nur Registrierung ueber Einladung
- Konsequenzen:
  - + kontrolliertes Onboarding
  - + weniger Angriffsflaeche
  - - Admin-Prozess fuer Einladungen ist zwingend erforderlich

## ADR-003: KI-Funktionen als Firebase Callable Functions

- Status: akzeptiert
- Kontext: KI-Calls muessen API-Keys schuetzen und Missbrauch begrenzen.
- Entscheidung:
  - Gemini-Aufrufe laufen nur serverseitig in Cloud Functions
  - Endpunkte nutzen App Check + Auth + Rate Limit
- Konsequenzen:
  - + Geheimnisse bleiben im Backend
  - + Missbrauchsschutz
  - - mehr Betriebslogik im Backend (Monitoring, Limits, Fehlerhandling)

## ADR-004: Modell-Fallback fuer KI-Verfuegbarkeit

- Status: akzeptiert
- Kontext: Quota/429-Fehler duerfen den Workflow nicht blockieren.
- Entscheidung: Primaermodell `gemini-3-flash-preview`, Fallback `gemini-2.5-flash`.
- Konsequenzen:
  - + hoehere Verfuegbarkeit bei Lastspitzen
  - + transparenter Rueckfall (verwendetes Modell wird zurueckgegeben)
  - - Ergebnisqualitaet kann je Modell variieren

## ADR-005: Aggregierte Ratings statt Einzelratings in Firestore

- Status: akzeptiert
- Kontext: Oeffentliche Bewertungen sollen ohne Account nutzbar sein.
- Entscheidung:
  - Firestore speichert nur Summen/Aggregate
  - Nutzer-spezifische Bewertung wird lokal im Browser gehalten
- Konsequenzen:
  - + einfache, guenstige Speicherung
  - + kein Login fuer Bewertungen noetig
  - - kein serverseitig verifizierbares User-Voting

## ADR-006: Einheitliche Designsprache mit Theme-Tokens

- Status: akzeptiert
- Kontext: Das Produkt braucht konsistente Therapie-UI fuer Public- und Adminbereich.
- Entscheidung:
  - zentrales Token-basiertes Designsystem in `index.css`
  - Light/Dark/System-Themes ueber `data-theme` und `ThemeProvider`
  - Adminbereich wird visuell auf Dark-Theme forciert
- Konsequenzen:
  - + hoher Wiedererkennungswert, klare Wartbarkeit
  - + konsistente Komponenten ueber Seiten hinweg
  - - striktes Festhalten an Tokens noetig, um Designdrift zu vermeiden

## ADR-007: Hosting-Deploy ueber GitHub Release Workflow

- Status: akzeptiert
- Kontext: Deployments sollen reproduzierbar und releasebasiert laufen.
- Entscheidung:
  - Push auf `main` triggert Test, Build, Hosting-Deploy und Tag-Release
  - Deploymentziel: Firebase Hosting (`rehasport-trainer`, channel `live`)
- Konsequenzen:
  - + automatisierter Releaseprozess
  - + klare Kette von Commit zu Live-Version
  - - Hotfixes brauchen disziplinierten Branch/PR-Prozess

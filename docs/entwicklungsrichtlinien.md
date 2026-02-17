# Entwicklungsrichtlinien

Stand: 17.02.2026

Diese Datei fasst konkrete Arbeitsregeln fuer die Weiterentwicklung zusammen.

## Inhaltliche Leitplanken (RehaSport)

- Sprache: Deutsch fuer Inhalte und Nutzertexte
- Sessions folgen dem 45-Minuten-Schema:
  - 10 Min Aufwaermen
  - 15 Min Hauptteil
  - 15 Min Schwerpunkt
  - 5 Min Ausklang
- Jede Uebung braucht:
  - Alternative bei Kniebeschwerden (`kneeAlternative`)
  - Alternative bei Schulterbeschwerden (`shoulderAlternative`)
  - Kontraindikationen

## Architekturregeln

- Firestore ist die primaere Datenquelle.
- Oeffentliche Session-Ansicht zeigt nur `status == published`.
- Admin/Trainer-Features nur fuer authentifizierte Nutzer mit Rolle.
- Neue Cloud Functions immer in `europe-west1`.

## Firebase und Sicherheit

- Firestore Rules sind Teil der Feature-Definition, nicht nachtraeglich.
- Sensitive Funktionalitaet nur serverseitig (Callable Functions).
- App Check bei missbrauchsrelevanten Endpunkten aktivieren.
- Keine Secrets in den Clientcode eintragen.

## Frontend-Standards

- Neue Seiten in Routing und Navigation konsistent einhaengen.
- Theme-Kompatibilitaet sicherstellen (light/dark/system).
- Design-Tokens aus `index.css` verwenden statt Hardcoding.
- Accessibility mitdenken:
  - semantische Struktur
  - Tastaturbedienung
  - klare Fokus-/Statusanzeige

## Datenmodell und Typen

- Firestore-Dokumente ueber zentrale Typen in `site/src/firebase/types.ts` modellieren.
- Bei neuen Feldern:
  - Typ erweitern
  - Loader und Admin-Formulare anpassen
  - Firestore Rules pruefen

## Tests und lokale Checks

- Frontend:
  - `npm run typecheck`
  - `npm test`
- Functions:
  - `npm run build`
- Vor Release sicherstellen, dass zentrale Flows laufen:
  - Login
  - Session/Uebungsanzeige
  - Admin-Navigation
  - KI-Builder (inkl. Rate-Limit-Feedback)

## Deployment-Disziplin

- `main` bleibt Release-Zweig (auto Deploy per Workflow).
- Aenderungen in kleinen, reviewbaren PRs liefern.
- Bei schema-/regelrelevanten Aenderungen: Rules und App-Code gemeinsam deploybar halten.

## Doku-Disziplin

- Technische Entscheidungen in `docs/entscheidungen_adr.md` nachziehen.
- Architekturveraenderungen in `docs/architektur.md` aktualisieren.
- Designaenderungen in `docs/design_system.md` dokumentieren.

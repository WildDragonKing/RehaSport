# Architekturentscheidungen (ADR)

Stand: 18.02.2026

## ADR-001: Firestore als zentrale Datenquelle

- Status: akzeptiert
- Kontext: Public-Inhalte sollen live und zentral gepflegt werden.
- Entscheidung: Stunden und Uebungen werden aus Firestore geladen.
- Konsequenzen:
  - + zentrale Datenhaltung
  - + kein statischer Content-Rebuild fuer jede inhaltliche Aenderung
  - - Frontend braucht robustes Fehler- und Ladeverhalten

## ADR-002: Astro als Public-Frontend

- Status: akzeptiert
- Kontext: Redesign sollte minimalistischer, strukturierter und performanter werden.
- Entscheidung: Public-Frontend auf Astro mit React-Inseln migriert.
- Konsequenzen:
  - + klare Trennung zwischen statischer Struktur und interaktiven Teilen
  - + geringere Komplexitaet als komplette SPA
  - - Detailrouten brauchen passgenaue Hosting-Rewrites

## ADR-003: Mobile-first und reduzierte UI

- Status: akzeptiert
- Kontext: Hauptnutzung ist unterwegs/waehrend Training.
- Entscheidung:
  - mobile-first Layout
  - monochromes Design mit einem Akzentton
  - keine dekorativen Effekte
- Konsequenzen:
  - + fokussierter Kernflow
  - + bessere Bedienbarkeit auf kleinen Screens
  - - weniger visuelle Differenzierung ueber Farben/Themes

## ADR-004: Kein PWA-/Service-Worker in Public V1

- Status: akzeptiert
- Kontext: V1 sollte auf Klarheit und stabile Kernfunktion reduziert werden.
- Entscheidung: keine PWA-Registrierung und keine Offline-Strategie im Public-Frontend.
- Konsequenzen:
  - + weniger Laufzeitkomplexitaet
  - + einfacheres Debugging
  - - keine Offline-Nutzung

## ADR-005: Alte Frontend-Generation entfernt

- Status: akzeptiert
- Kontext: Nach Relaunch wurde kein Parallelbetrieb der alten Seite mehr gewuenscht.
- Entscheidung: alte React/Vite-Struktur inkl. Admin-UI aus `site` entfernt.
- Konsequenzen:
  - + klare Codebasis ohne doppelte Pfade
  - + weniger Wartungslast
  - - Trainer/Admin-Frontend muss in eigener Folgephase neu aufgebaut werden

## ADR-006: CI Build mit `PUBLIC_FIREBASE_*`

- Status: akzeptiert
- Kontext: Astro nutzt `PUBLIC_*`-Umgebungsvariablen fuer Client-exponierte Werte.
- Entscheidung: Workflow uebergibt beim Build `PUBLIC_FIREBASE_*`-Variablen.
- Konsequenzen:
  - + konsistente Env-Konvention fuer Astro
  - + sauberer Build in CI
  - - bei Secret-Umbenennungen ist CI-Anpassung noetig

## ADR-007: Rechtliche Mindestseiten im Public-Frontend

- Status: akzeptiert
- Kontext: Die oeffentliche Seite braucht eine klare, dauerhaft erreichbare rechtliche Basis.
- Entscheidung:
  - statische Seiten fuer `Impressum` und `Datenschutz` im Astro-Public-Frontend
  - direkte Verlinkung im Footer jeder Seite
- Konsequenzen:
  - + Pflichtinhalte sind fuer Nutzer und Aufsicht direkt erreichbar
  - + kein Einfluss auf den interaktiven Kernflow
  - - Betreiberdaten und Rechtstexte muessen inhaltlich gepflegt und juristisch geprueft werden

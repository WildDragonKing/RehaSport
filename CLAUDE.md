# Claude-Anweisungen für das RehaSport-Projekt

## Synchronisation & Dokumentationspflege
- Änderungen an diesem Dokument, an `AGENTS.md` und an `.github/copilot-instructions.md` müssen immer gemeinsam geprüft und synchronisiert werden.
- Führe notwendige Anpassungen in allen drei Dokumenten im selben Commit durch, damit keine widersprüchlichen Regeln entstehen.
- Halte die Projektdokumentation konsolidiert, entferne redundante Passagen und verzichte auf das Anlegen unnötiger zusätzlicher Markdown-Dateien.

## Kernleitplanken
- Alle Inhalte werden auf Deutsch verfasst; Dateinamen nutzen Kleinbuchstaben und Unterstriche.
- Trainingsstunden folgen strikt dem 45-Minuten-Schema (10 Min Aufwärmen, 15 Min Hauptteil, 15 Min Schwerpunkt, 5 Min Ausklang).
- Jede Übung dokumentiert Alternativen für Knie- (`🦵`) und Schulterbeschwerden (`💪`) sowie vollständige Kontraindikationen.
- Templates in `Übungen/` und `stunden/` sind verbindlich und dürfen nicht verändert werden.
- Nutze die Leitfäden im Ordner `Anleitung/` und halte Konzepte (`Konzepte/`), Stunden (`stunden/`) und Übungen (`Übungen/`) sauber miteinander verknüpft.

## Kommunikationsstil
- Bleibe fachlich präzise, empathisch und sicherheitsorientiert („Im Zweifel konservativ").
- Hebe bei Empfehlungen stets die medizinische Sicherheit, Barrierefreiheit und klare Alternativen hervor.

## Umbau: Firebase-Migration (Stand: Januar 2026)

### Architektur-Änderungen
- **Hosting:** Firebase Hosting (statt GitHub Pages)
- **Datenbank:** Firestore (statt lokale Markdown-Dateien als Quelle)
- **Auth:** Firebase Auth mit Rollen (Admin, Trainer)
- **KI-Backend:** Google Gemini via Cloud Functions
- **Projekt-ID:** `rehasport-trainer`

### Benutzerrollen
- **Admin:** Vollzugriff, kann Trainer einladen und Entwürfe freigeben
- **Trainer:** KI-Builder nutzen, eigene Stunden/Gruppen verwalten (Entwürfe brauchen Admin-Freigabe)
- **Teilnehmer:** Öffentlicher Zugang ohne Login

### Neue Verzeichnisstruktur
- `site/src/firebase/` - Firebase-Konfiguration und -Services
- `site/src/contexts/` - React Contexts (Auth)
- `site/src/pages/admin/` - Admin-Bereich
- `functions/` - Cloud Functions (Gemini-Integration, noch zu erstellen)

### Datenformat
- Stunden und Übungen werden in Firestore als JSON-Dokumente gespeichert
- Das 45-Minuten-Schema bleibt erhalten (4 Phasen)
- Alternativen (🦵 Knie, 💪 Schulter) werden als strukturierte Objekte gespeichert
- Markdown-Dateien bleiben als Backup, sind aber nicht mehr die primäre Datenquelle

### KI-Stunden-Builder
- Nutzt Google Gemini für Stunden-Generierung
- Prompt enthält: Thema, Schwierigkeit, Gruppen-Einschränkungen, verfügbare Übungen
- Generierte Stunden werden als Entwürfe gespeichert
- Admin-Freigabe erforderlich vor Veröffentlichung

### Gruppen-System
- Trainer können Gruppen mit Einschränkungen anlegen (z.B. Knieprobleme)
- Stunden können für Gruppen angepasst werden (Alternativen werden automatisch angezeigt)

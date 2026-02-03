# Copilot-Anweisungen für das RehaSport-Projekt

## Projektübersicht

Dies ist ein deutschsprachiges Dokumentationssystem für Rehabilitationssport (RehaSport) zum Erstellen und Verwalten von Übungssammlungen und 45-minütigen Trainingsstunden. Das Projekt folgt strengen Qualitätsstandards für medizinische Sicherheit und Barrierefreiheit.

**Projektsprache**: Deutsch (alle Inhalte, Dateinamen und Dokumentation)

**Synchronisationspflicht**: Änderungen an diesen Copilot-Anweisungen, an `AGENTS.md` oder an `claude.md` müssen immer miteinander abgestimmt und im selben Commit vorgenommen werden. Halte die Dokumentation konsolidiert, entferne Redundanzen und verzichte auf unnötige zusätzliche Markdown-Dateien.

## Architektur & Struktur

### Kernkomponenten

- **`Übungen/`** - Übungsdatenbank mit detaillierten medizinischen Informationen
- **`stunden/`** - 45-minütige Trainingsstunden nach dem 10-15-15-5-Minuten-Schema
- **`Anleitung/`** - Systemdokumentation und Erstellungshilfen
- **`Konzepte/`** - Thematische Konzepte, die Übungen verbinden
- **Templates** - `Übungen/_template_übung.md` und `stunden/_template_stunde.md` (MÜSSEN verwendet werden, niemals ändern)

### Die 45-Minuten-Struktur

ALLE Trainingsstunden MÜSSEN exakt dieser Zeitaufteilung folgen:

| Phase | Dauer | Zweck |
|-------|-------|-------|
| Aufwärmen | 10 Min | Aktivierung, Mobilisation |
| Hauptteil | 15 Min | Kraft, Ausdauer |
| Schwerpunkt | 15 Min | Themenspezifische Vertiefung |
| Ausklang | 5 Min | Cool-down, Dehnung |

## Kritische medizinische Anforderungen

### Pflicht-Alternativen (KEINE AUSNAHMEN)

Jede Übung MUSS Alternativen bieten für:
1. **Knieprobleme** (`🦵`) - ~40-50% der Teilnehmer haben Kniebeschwerden
2. **Schulterprobleme** (`💪`) - ~30-40% haben Schulterbeschwerden

**Beispiele**:
- Tiefe Kniebeuge → Flache Kniebeuge (<45°) oder mit Stuhlunterstützung
- Arme über Kopf → Arme nur bis Schulterhöhe
- Planke auf Händen → Wandplanke oder Knie-Planke

### Kontraindikationen sind PFLICHT

Jede Übung muss dokumentieren:
- Akute Verletzungen, die zu vermeiden sind
- Zustände, die besondere Vorsicht erfordern
- Absolute Ausschlusskriterien

**Niemals leer lassen** - recherchieren oder medizinische Quellen konsultieren bei Unsicherheit.

## Dateinamen & Organisation

### Übungen
- Format: `kleinbuchstaben_mit_unterstrichen.md`
- ✅ Gut: `schulterkreisen.md`, `kniebeuge_wandstütze.md`
- ❌ Schlecht: `Übung1.md`, `Schulterkreisen.md` (Großbuchstabe), `schulter kreisen.md` (Leerzeichen)

### Trainingsstunden
- Format: `stunde_[Nr]_[kurzbeschreibung].md`
- ✅ Gut: `stunde_01_rückenfit.md`, `stunde_02_balance.md`
- ❌ Schlecht: `Stunde1.md`, `rückenfit.md` (keine Nummer)

## Workflow-Muster

### Neue Übung erstellen

1. `Übungen/_template_übung.md` kopieren
2. ALLE Pflichtfelder ausfüllen (Checklisten in CONTRIBUTING.md beachten)
3. Knie- UND Schulteralternativen dokumentieren (konkret, nicht "Übung auslassen")
4. Beschreibenden Dateinamen in kleinbuchstaben_mit_unterstrichen verwenden
5. **WICHTIG**: `Übungen/ÜBUNGSINDEX.md` aktualisieren:
   - Übung in die richtige Phase-Tabelle eintragen (Aufwärmen/Hauptteil/Schwerpunkt/Ausklang)
   - In "Nach Schwerpunkt"-Sektion hinzufügen (Kraft/Beweglichkeit/etc.)
   - Zu "Neueste Übungen" hinzufügen
   - "Anzahl Übungen gesamt" erhöhen
   - "Stand"-Datum aktualisieren

### Neue Trainingsstunde erstellen

1. Konzept/Thema wählen (muss durch alle Übungen kohärent sein)
2. `stunden/_template_stunde.md` kopieren
3. 8-12 Übungen aus Datenbank auswählen (2-3 pro Phase)
4. Timing prüfen - muss exakt 45 Minuten ergeben
5. Sicherstellen, dass JEDE Übung Knie- UND Schulteralternativen hat
6. Zu Übungen verlinken: `[Name](../Übungen/dateiname.md)`

### Dokumentations-Querverweise

Beim Bearbeiten von Übungen aktualisieren:
- "Wird verwendet in"-Sektion in der Übungsdatei, wenn in neuer Stunde verwendet
- "Verwendung in Stunden"-Sektion im `ÜBUNGSINDEX.md` entsprechend ergänzen
- Verwandte Übungen für ähnliche Bewegungen

Beim Löschen von Übungen:
- Übung aus allen Tabellen im `ÜBUNGSINDEX.md` entfernen
- "Anzahl Übungen gesamt" reduzieren
- Alle Stunden prüfen, die diese Übung verwenden

## Pflichtlektüre vor dem Erstellen von Inhalten

**Vor Übungen**: In dieser Reihenfolge lesen:
1. `Anleitung/system_übersicht.md`
2. `Anleitung/übungen_erstellen.md`  
3. `Anleitung/alternative_übungen.md`

**Vor Stunden**: Lesen:
1. `Anleitung/system_übersicht.md`
2. `Anleitung/stunden_planen.md`
3. `Anleitung/alternative_übungen.md`

## Tag-System (Pflicht)

### Für Übungen (mind. 3 Tags)
- **Bereich**: `#aufwärmen` `#hauptteil` `#schwerpunkt` `#ausklang`
- **Schwerpunkt**: `#kraft` `#ausdauer` `#beweglichkeit` `#koordination` `#balance`
- **Anpassung**: `#knie-freundlich` `#schulter-freundlich` `#anfänger` `#fortgeschritten`

### Für Stunden (mind. 3 Tags)
- **Konzept**: `#rückengesundheit` `#balance` `#ganzkörper`
- **Zielgruppe**: `#orthopädie` `#herz-kreislauf` `#neurologie` `#allgemein`
- **Niveau**: `#anfänger` `#mittel` `#fortgeschritten`

## Qualitätsstandards

### Nicht verhandelbare Anforderungen
- ✅ ALLE Template-Felder müssen ausgefüllt sein (kein "TBD" oder leere Abschnitte)
- ✅ Beschreibungen müssen für Übungsleiter ohne Vorkenntnisse verständlich sein
- ✅ Knie- UND Schulteralternativen sind konkret und sicher (niemals "Übung auslassen")
- ✅ Kontraindikationen sind medizinisch korrekt und vollständig
- ✅ Stundenkonzept ist kohärent (alle Übungen dienen demselben Thema)
- ✅ Zeitangaben sind realistisch und ergeben 45 Minuten

### Häufige Fehler vermeiden
- ❌ Vage Alternativen wie "Bei Problemen anpassen"
- ❌ Fehlende Kontraindikationen (medizinisches Sicherheitsrisiko!)
- ❌ Zufällige Übungssammlung ohne kohärentes Konzept
- ❌ Falsche Zeitverteilung (muss 10-15-15-5 sein, nicht 20-20-5-0)
- ❌ Templates verwenden ohne erforderliche Dokumentation zu lesen

## Entwicklungs-Kommandos

Kein Build-System - dies ist ein reines Dokumentationsprojekt mit Markdown-Dateien.

## Wichtige Referenzdateien

Beim Erstellen von Inhalten diese Beispiele studieren:
- **Übungsbeispiel**: `Übungen/schulterkreisen.md`
- **Stundenbeispiel**: `stunden/ruecken/stabilitaet-und-mobilisation.md`
- **Anpassungsleitfaden**: `Anleitung/alternative_übungen.md`
- **Qualitätscheckliste**: `CONTRIBUTING.md` (Abschnitt "Checkliste vor dem Veröffentlichen")

## Medizinische Sicherheitsphilosophie

**"Im Zweifel konservativ"** - Bei Unsicherheit über Kontraindikationen oder Alternativen:
- MEHR Kontraindikationen dokumentieren statt weniger
- SICHERERE Alternativen anbieten statt risikoreichere
- Sicherheit über Intensität betonen
- Dies ist medizinische Rehabilitation, nicht Leistungssport

## Richtlinien für KI-Assistenten

1. **Immer Templates verwenden** - Niemals Übungen/Stunden von Grund auf neu erstellen
2. **Dokumentation zuerst lesen** - system_übersicht.md prüfen vor Änderungsvorschlägen
3. **Medizinische Genauigkeit ist wichtig** - Bei Unsicherheit über Kontraindikationen zur Überprüfung kennzeichnen
4. **Kohärenz über Quantität** - Eine Stunde mit 8 gut abgestimmten Übungen schlägt 15 zufällige
5. **Durchgängig Deutsch** - Alle Inhalte, Dateinamen, Dokumentation auf Deutsch
6. **Alternativen sind nicht optional** - Jede Übung braucht Knie + Schulter-Alternativen, keine Ausnahmen

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
- `functions/` - Cloud Functions (Gemini-Integration)

### Datenformat
- Stunden und Übungen werden in Firestore als JSON-Dokumente gespeichert
- Das 45-Minuten-Schema bleibt erhalten (4 Phasen)
- Alternativen (🦵 Knie, 💪 Schulter) werden als strukturierte Objekte gespeichert
- Markdown-Dateien bleiben als Backup, sind aber nicht mehr die primäre Datenquelle

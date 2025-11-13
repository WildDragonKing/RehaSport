# Anleitung: Stunden planen

## Übersicht

Diese Anleitung zeigt, wie Sie kohärente 45-minütige RehaSport-Stunden planen. Jede Stunde folgt einem thematischen Konzept und nutzt Übungen aus der Übungsdatenbank.

## Das 45-Minuten-Schema

Jede Stunde ist klar strukturiert:

| Phase | Dauer | Anteil | Ziel |
|-------|-------|--------|------|
| **Aufwärmen** | 10 Min | 22% | Aktivierung, Mobilisation, Vorbereitung |
| **Hauptteil** | 15 Min | 33% | Kraft, Ausdauer, funktionelle Bewegungen |
| **Schwerpunkt** | 15 Min | 33% | Themenspezifische Übungen |
| **Ausklang** | 10 Min | 22% | Dehnung, Entspannung, Regeneration |

## Konzept-basierte Planung

### Was ist ein Konzept?

Ein Konzept ist das übergeordnete Thema, das die gesamte Stunde zusammenhält. Alle Übungen bauen aufeinander auf und verfolgen ein gemeinsames Ziel.

### Beispiele für Konzepte

- **Rückengesundheit**: Stärkung der Rückenmuskulatur, Haltungsverbesserung
- **Gelenkstabilität**: Kräftigung gelenkstabilisierender Muskulatur
- **Balance und Koordination**: Sturzprophylaxe, Gleichgewichtstraining
- **Beweglichkeit**: Mobilisation, Dehnungen, Flexibilität
- **Herz-Kreislauf**: Ausdauertraining, Kreislaufaktivierung
- **Ganzkörper-Kraft**: Allgemeine Kräftigung aller Muskelgruppen

Siehe auch: [Konzepte/](../Konzepte/) für detaillierte Konzeptbeschreibungen

## Schritt-für-Schritt Anleitung

### 1. Konzept festlegen

Wählen Sie ein Thema, das:

- Zu Ihrer Zielgruppe passt
- Medizinisch sinnvoll ist
- Ausreichend Übungsmaterial bietet
- Sich über alle 4 Phasen erstrecken lässt

**Beispiel:** "Rückenstabilität und Haltung"

### 2. Template kopieren

1. Öffnen Sie `Stunden/_template_stunde.md`
2. Kopieren Sie den Inhalt
3. Erstellen Sie neue Datei: z.B. `stunde_01_rücken_stabilität.md`

**Namenskonvention:**

- `stunde_[Nr]_[Kurzbeschreibung].md`
- Beispiele: `stunde_01_rücken.md`, `stunde_02_balance.md`

### 3. Übersicht ausfüllen

```markdown
## Übersicht
- **Konzept**: Rückenstabilität und Haltungsverbesserung
- **Gesamtdauer**: 45 Minuten
- **Schwierigkeitsgrad**: Mittel
- **Zielgruppe**: Orthopädie, Rückenschmerzen
- **Datum**: 13.11.2025
```

### 4. Lernziele definieren

Formulieren Sie 3-5 konkrete Ziele:

```markdown
## Lernziele
- Kräftigung der tiefen Rückenmuskulatur
- Verbesserung der Körperwahrnehmung und Haltung
- Stärkung der rumpfstabilisierenden Muskulatur
- Schmerzreduktion durch gezielte Mobilisation
```

### 5. Übungen für jede Phase auswählen

#### Phase 1: Aufwärmen (10 Min)

**Ziel:** Vorbereitung, sanfte Aktivierung

- 2-3 Übungen
- Fokus: Mobilisation, leichte Bewegung
- Beispiele: Schulterkreisen, Beckenkippen, sanftes Gehen

```markdown
### Übung 1.1: Schulterkreisen
- **Dauer**: 3 Minuten
- **Wiederholungen**: 10 vorwärts, 10 rückwärts
- **Beschreibung**: [Schulterkreisen](../Übungen/schulterkreisen.md)
- **🦵 Alternative bei Knieproblemen**: Im Sitzen ausführen
- **💪 Alternative bei Schulterproblemen**: Reduzierter Bewegungsumfang
```

#### Phase 2: Hauptteil (15 Min)

**Ziel:** Kräftigung, Ausdauer

- 3-4 Übungen
- Fokus: Kraftübungen mit mehr Wiederholungen
- Sets/Wiederholungen klar angeben

```markdown
### Übung 2.1: Vierfüßlerstand mit Arm-/Beinhebung
- **Dauer**: 5 Minuten
- **Wiederholungen/Sets**: 3x10 pro Seite
- **Beschreibung**: [Vierfüßler diagonal](../Übungen/vierfüssler_diagonal.md)
- **🦵 Alternative bei Knieproblemen**: Kissen unter Knie legen
- **💪 Alternative bei Schulterproblemen**: Nur Beinhebung
```

#### Phase 3: Schwerpunkt (15 Min)

**Ziel:** Themenspezifische Vertiefung

- 2-3 intensive Übungen
- Hier wird das Konzept am deutlichsten
- Längere Dauer pro Übung

```markdown
## 3. Schwerpunkt (15 Minuten)

**Thema**: Rumpfstabilität und Core-Kräftigung

### Übung 3.1: Planke-Variationen
- **Dauer**: 8 Minuten
- **Wiederholungen/Sets**: 3x30 Sekunden halten
- **Beschreibung**: [Planke](../Übungen/planke_variationen.md)
- **🦵 Alternative bei Knieproblemen**: Planke auf Knien
- **💪 Alternative bei Schulterproblemen**: Unterarmstütz statt Liegestütz-Position
```

#### Phase 4: Ausklang (10 Min)

**Ziel:** Dehnung, Entspannung

- 2-3 ruhige Übungen
- Fokus: Stretching, Atemübungen, Entspannung
- Sanfter Abschluss

```markdown
### Übung 4.1: Rückenstreckung (Katze-Kuh)
- **Dauer**: 5 Minuten
- **Beschreibung**: [Katze-Kuh-Stretch](../Übungen/katze_kuh.md)
- **🦵 Alternative bei Knieproblemen**: Im Stehen an Wand
- **💪 Alternative bei Schulterproblemen**: Reduzierte Amplitude
```

### 6. Alternativen einbauen (PFLICHT!)

**Für JEDE Übung müssen Sie Alternativen angeben:**

- 🦵 **Bei Knieproblemen**: Was tun, wenn Knie betroffen?
- 💪 **Bei Schulterproblemen**: Was tun, wenn Schultern betroffen?

**Beispiele:**

- Kniebeuge → Im Sitzen auf Stuhl setzen/aufstehen
- Liegestütze → Wandliegestütze oder auf Knien
- Plank → Auf Knien statt Füßen
- Überkopf-Bewegungen → Arme auf Schulterhöhe

### 7. Hinweise für Übungsleiter

```markdown
## Wichtige Hinweise für den Übungsleiter
- Auf korrekte Ausführung achten - Qualität vor Quantität
- Teilnehmer zu neutraler Wirbelsäule anleiten
- Bei Schmerzen sofort pausieren lassen
- Regelmäßig Trinkpausen einbauen
```

### 8. Anpassungen dokumentieren

```markdown
## Anpassungen je nach Gruppe
- **Anfänger**: Weniger Wiederholungen (2x8 statt 3x12), mehr Pausen
- **Fortgeschrittene**: Zusatzgewichte, längere Haltezeiten, komplexere Variationen
- **Senioren**: Stuhl als Unterstützung, langsameres Tempo, häufigere Pausen
```

## Konzept-Kohärenz sicherstellen

### Wie erstellt man eine zusammenhängende Stunde?

**✅ Gute Kohärenz:**

```
Konzept: Rückengesundheit
- Aufwärmen: Wirbelsäulenmobilisation
- Hauptteil: Rücken- und Bauchmuskulatur kräftigen
- Schwerpunkt: Core-Stabilität, Haltungsübungen
- Ausklang: Rückenmuskulatur dehnen
→ Alles dient dem Rückenziel!
```

**❌ Schlechte Kohärenz:**

```
Konzept: (unklar)
- Aufwärmen: Armkreisen
- Hauptteil: Beintraining
- Schwerpunkt: Balance
- Ausklang: Schulter-Dehnung
→ Kein roter Faden erkennbar!
```

### Der rote Faden

1. **Einleitung** (Aufwärmen): Thema sanft einführen
2. **Aufbau** (Hauptteil): Thema aktiv trainieren
3. **Höhepunkt** (Schwerpunkt): Thema intensiv vertiefen
4. **Abschluss** (Ausklang): Thema abrunden, entspannen

## Zeitmanagement

### Zeitplanung pro Phase

**Aufwärmen (10 Min):**

- 2-3 Übungen à 3-4 Minuten

**Hauptteil (15 Min):**

- 3 Übungen à 5 Minuten
- ODER 4 Übungen à 3-4 Minuten

**Schwerpunkt (15 Min):**

- 2 Übungen à 7-8 Minuten
- ODER 3 Übungen à 5 Minuten

**Ausklang (10 Min):**

- 2 Übungen à 5 Minuten
- ODER 3 Übungen à 3-4 Minuten

### Pufferzeit einplanen

- Übergänge zwischen Übungen: ~30 Sekunden
- Erklärungszeit: ~1 Minute pro neue Übung
- Trinken/Verschnaufen: In Hauptteil einrechnen

## Checkliste vor dem Veröffentlichen

- [ ] Konzept ist klar definiert
- [ ] Alle 4 Phasen zeitlich korrekt (10-15-15-10)
- [ ] Lernziele sind formuliert
- [ ] Benötigte Materialien aufgelistet
- [ ] Jede Übung hat Knie-Alternative
- [ ] Jede Übung hat Schulter-Alternative
- [ ] Übungen bauen aufeinander auf (Kohärenz)
- [ ] Hinweise für Übungsleiter vorhanden
- [ ] Anpassungen für verschiedene Niveaus
- [ ] Tags gesetzt
- [ ] Datum eingetragen

## Qualitätskriterien

**Eine gute Stunde:**

- Hat ein klares, durchgängiges Konzept
- Ist ausgewogen über alle Phasen
- Bietet für jeden Teilnehmer Anpassungen
- Ist praktikabel und zeitlich realistisch
- Berücksichtigt medizinische Sicherheit

## Beispiel-Konzepte

### Konzept 1: "Rückenfit"

- Aufwärmen: Wirbelsäulenmobilisation
- Hauptteil: Rücken-/Bauchmuskulatur
- Schwerpunkt: Haltungsschulung, Core
- Ausklang: Rückendehnung, Entspannung

### Konzept 2: "Balance & Koordination"

- Aufwärmen: Sanfte Gewichtsverlagerungen
- Hauptteil: Beinachsenstabilität
- Schwerpunkt: Einbeinstand-Variationen
- Ausklang: Wadendehnung, Fußgymnastik

### Konzept 3: "Ganzkörper-Kraft"

- Aufwärmen: Dynamische Ganzkörper-Bewegungen
- Hauptteil: Kraftzirkel alle Muskelgruppen
- Schwerpunkt: Funktionelle Kombinationsübungen
- Ausklang: Ganzkörper-Stretching

## Häufige Fehler

❌ **Zu viele Übungen**: 15 Übungen in 45 Minuten  
✅ **Realistische Anzahl**: 8-12 Übungen gesamt

❌ **Kein roter Faden**: Beliebige Übungs-Sammlung  
✅ **Klares Konzept**: Alle Übungen dienen einem Ziel

❌ **Keine Alternativen**: "Bei Problemen pausieren"  
✅ **Konkrete Alternativen**: Für Knie und Schulter

❌ **Falsche Zeitaufteilung**: 20-20-5-0 Minuten  
✅ **Standard-Schema**: 10-15-15-10 Minuten

## Nächste Schritte

1. Erstellen Sie Ihre erste Stunde mit einem einfachen Konzept
2. Nutzen Sie vorhandene Übungen aus der Datenbank
3. Testen Sie die Stunde gedanklich durch (Timing!)
4. Erweitern Sie Ihre Stundensammlung schrittweise

---
**Letzte Aktualisierung**: 13.11.2025

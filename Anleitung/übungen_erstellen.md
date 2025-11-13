# Anleitung: Übungen erstellen

## Übersicht

Diese Anleitung zeigt Schritt für Schritt, wie Sie neue Übungen für die RehaSport-Sammlung erstellen. Jede Übung wird als eigenständige Markdown-Datei dokumentiert und kann dann in mehreren Trainingsstunden wiederverwendet werden.

## Voraussetzungen

- Template-Datei: `Übungen/_template_übung.md`
- Grundverständnis der Übung (Ausführung, Zielmuskulatur, Risiken)
- Kenntnis über mögliche Anpassungen für unterschiedliche Einschränkungen

## Schritt-für-Schritt Anleitung

### 1. Template kopieren

1. Öffnen Sie `Übungen/_template_übung.md`
2. Kopieren Sie den gesamten Inhalt
3. Erstellen Sie eine neue Datei in `Übungen/`
4. Benennen Sie die Datei beschreibend: z.B. `kniebeuge_wandstuetze.md`

**Namenskonvention:**

- Kleinbuchstaben
- Unterstriche statt Leerzeichen
- Beschreibend und eindeutig
- Beispiele: `schulterkreisen.md`, `planke_variationen.md`, `dehnung_wadenmuskeln.md`

### 2. Kategorie festlegen

Füllen Sie die Kategoriefelder aus:

```markdown
## Kategorie
- **Bereich**: Aufwärmen
- **Schwerpunkt**: Beweglichkeit
- **Dauer**: 2 Minuten
- **Schwierigkeitsgrad**: Leicht
```

**Bereich-Optionen:**

- Aufwärmen (Mobilisation, Aktivierung)
- Hauptteil (Kraft, Ausdauer)
- Schwerpunkt (Themenbezogene Übungen)
- Ausklang (Dehnung, Entspannung)

**Schwerpunkt-Optionen:**

- Kraft
- Ausdauer
- Beweglichkeit
- Koordination
- Balance

### 3. Beschreibung und Ausführung

**Beschreibung:** Erklären Sie den Zweck und Nutzen der Übung

```markdown
## Beschreibung
Diese Übung mobilisiert die Schultergelenke und bereitet die 
Schultermuskulatur auf Belastung vor. Ideal zur Verbesserung 
der Beweglichkeit im Schulterbereich.
```

**Ausführung:** Schritt-für-Schritt Anleitung

```markdown
## Ausführung
1. Aufrechter Stand, Füße hüftbreit, Arme locker an der Seite
2. Langsam beide Schultern nach hinten kreisen (10 Wiederholungen)
3. Richtungswechsel: Schultern nach vorne kreisen (10 Wiederholungen)
4. Kontrollierte, fließende Bewegungen ohne Schwung
```

### 4. Zielmuskulatur und Hilfsmittel

```markdown
## Zielmuskulatur
- **Primär**: Schultermuskulatur (Deltamuskel)
- **Sekundär**: Oberer Rücken (Trapezmuskel)

## Hilfsmittel
- Keine
```

### 5. Eignung und Kontraindikationen (WICHTIG!)

**Besonders wichtig für medizinische Sicherheit:**

```markdown
## Geeignet für
- Personen mit Schulterverspannungen
- Zur Verbesserung der Schulterbeweglichkeit
- **Besonders empfohlen bei**: Sitzende Tätigkeiten, Haltungsprobleme

## Nicht geeignet für / Kontraindikationen
- ⚠️ **Nicht bei akuten Verletzungen**: Frische Schulterverletzungen, Luxation
- ⚠️ **Vorsicht bei**: Frozen Shoulder (angepasster Bewegungsumfang)
- ⚠️ **Kontraindiziert bei**: Akute Entzündungen im Schultergelenk
```

### 6. Alternativen (PFLICHT!)

**Für jede Übung müssen mindestens Knie- und Schulter-Alternativen angegeben werden:**

```markdown
## Alternativen

### Bei Knieproblemen
- **Alternative Übung**: Im Sitzen ausführen
- **Anpassung**: Auf Stuhl setzen, gleiche Bewegung
- **Hinweis**: Volle Bewegungsamplitude möglich

### Bei Schulterproblemen
- **Alternative Übung**: Reduzierter Bewegungsumfang
- **Anpassung**: Nur so weit kreisen, wie schmerzfrei möglich
- **Hinweis**: Keine Gewalt, bei Schmerz sofort stoppen

### Weitere Anpassungen
- **Vereinfachung (Anfänger)**: Langsameres Tempo, weniger Wiederholungen
- **Steigerung (Fortgeschrittene)**: Mit leichten Gewichten (0,5-1kg)
- **Für Senioren**: Im Sitzen, mit Pausen zwischen den Wiederholungen
```

### 7. Wichtige Hinweise

```markdown
## Wichtige Hinweise
- **Atmung**: Gleichmäßig weiteratmen, nicht Luft anhalten
- **Häufige Fehler**: Schultern zu den Ohren ziehen - bewusst entspannen
- **Sicherheit**: Nur schmerzfreier Bewegungsbereich
- **Tempo**: Langsam und kontrolliert, kein Schwung
```

### 8. Variationen und verwandte Übungen

```markdown
## Variationen
- **Variation 1**: Abwechselnd einzelne Schulter kreisen
- **Variation 2**: Mit Armen auf Schulterhöhe ausgestreckt

## Verwandte Übungen
- [Armkreisen](armkreisen.md)
- [Nackenmobilisation](nackenmobilisation.md)
```

### 9. Wissenswertes hinzufügen

```markdown
## Wissenswertes
Die Schulter ist das beweglichste Gelenk des menschlichen Körpers.
Regelmäßige Mobilisation kann helfen, Verspannungen vorzubeugen 
und die Durchblutung zu fördern.
```

### 10. Tags und Metadaten

```markdown
---
**Tags**: #aufwärmen #beweglichkeit #schulter #anfänger  
**Erstellt**: 13.11.2025  
**Letzte Änderung**: 13.11.2025
```

## Checkliste vor dem Speichern

- [ ] Dateiname ist beschreibend und eindeutig
- [ ] Alle Kategoriefelder ausgefüllt
- [ ] Ausführung ist Schritt-für-Schritt dokumentiert
- [ ] Zielmuskulatur benannt
- [ ] Kontraindikationen vollständig
- [ ] **Alternative bei Knieproblemen angegeben**
- [ ] **Alternative bei Schulterproblemen angegeben**
- [ ] Wichtige Hinweise zu Atmung und Sicherheit
- [ ] Tags gesetzt
- [ ] Datum eingetragen

## Qualitätskriterien

**Eine gute Übungsdokumentation:**

- Ist so detailliert, dass ein Übungsleiter sie ohne Vorkenntnisse ausführen kann
- Berücksichtigt medizinische Sicherheit (Kontraindikationen)
- Bietet Anpassungen für häufige Einschränkungen
- Ist in einfacher, verständlicher Sprache geschrieben
- Enthält praktische Tipps zur Fehlerkorrektur

## Häufige Fehler vermeiden

❌ **Zu vage Beschreibungen:** "Bewegung ausführen"  
✅ **Konkrete Anweisungen:** "Füße hüftbreit, Knie leicht gebeugt, ..."

❌ **Fehlende Kontraindikationen:** Medizinische Risiken ignorieren  
✅ **Vollständige Sicherheitshinweise:** Alle relevanten Ausschlusskriterien nennen

❌ **Keine Alternativen:** Nur Standard-Übung dokumentiert  
✅ **Umfassende Alternativen:** Mindestens für Knie und Schulter

❌ **Komplizierte Fachsprache:** "Exspiration während konzentrischer Phase"  
✅ **Verständliche Sprache:** "Beim Anspannen ausatmen"

## Beispiele

Siehe Beispiel-Übungen im `Übungen/`-Ordner:

- (Werden schrittweise ergänzt)

## Nächste Schritte

Nach dem Erstellen von Übungen:

1. Erstellen Sie 10-15 Basis-Übungen für alle 4 Phasen
2. Verwenden Sie diese Übungen in [Stunden](stunden_planen.md)
3. Ergänzen Sie die Übungsdatenbank kontinuierlich

---
**Letzte Aktualisierung**: 13.11.2025

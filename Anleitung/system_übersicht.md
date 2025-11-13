# System-Übersicht: RehaSport Übungs- und Stundensammlung

## Zweck dieses Projekts

Diese RehaSport-Sammlung dient als umfassendes Dokumentationssystem für Rehabilitations-Übungen und strukturierte Trainingsstunden. Das System ermöglicht:

- **Zentrale Übungsdatenbank**: Alle Übungen mit detaillierten Beschreibungen, medizinischen Hinweisen und Anpassungsmöglichkeiten
- **Strukturierte Stunden**: 45-minütige Trainingseinheiten nach bewährtem RehaSport-Konzept
- **Barrierefreie Alternativen**: Jede Übung mit Anpassungen für Knie- und Schulterprobleme
- **Konsistente Dokumentation**: Einheitliche Templates für einfache Erstellung und Wartung

## Projektstruktur

```
RehaSport/
├── README.md                          # Haupteinstieg und Navigation
├── Prüfung/                          # Referenzmaterialien und Prüfungsunterlagen
├── Übungen/                          # Übungsdatenbank
│   ├── _template_übung.md            # Vorlage für neue Übungen
│   └── [einzelne Übungsdateien]      # z.B. kniebeuge_variationen.md
├── Stunden/                          # Trainingseinheiten
│   ├── _template_stunde.md           # Vorlage für neue Stunden
│   └── [einzelne Stunden]            # z.B. stunde_01_rücken.md
├── Anleitung/                        # Dokumentation
│   ├── system_übersicht.md           # Diese Datei
│   ├── übungen_erstellen.md          # Anleitung zum Erstellen von Übungen
│   ├── stunden_planen.md             # Anleitung zum Planen von Stunden
│   └── alternative_übungen.md        # Prinzipien für Anpassungen
└── Konzepte/                         # Thematische Schwerpunkte
    └── [Konzeptdateien]              # z.B. rückengesundheit.md
```

## Arbeitsablauf

### 1. Übungen erstellen

1. Template kopieren: `Übungen/_template_übung.md`
2. Mit Inhalt füllen (siehe [Übungen erstellen](übungen_erstellen.md))
3. Speichern unter beschreibendem Namen
4. **Wichtig**: Alternativen für Knie und Schulter dokumentieren

### 2. Stunden planen

1. Konzept/Thema festlegen (siehe [Konzepte/](../Konzepte/))
2. Template kopieren: `Stunden/_template_stunde.md`
3. Übungen auswählen und zuordnen (siehe [Stunden planen](stunden_planen.md))
4. Zeitplan einhalten: 10-15-15-10 Minuten
5. Für jede Übung Alternativen angeben

### 3. Verknüpfungen nutzen

- Stunden verlinken auf Übungsdateien: `[Übungsname](../Übungen/dateiname.md)`
- Verwandte Übungen cross-referenzieren
- Konzepte in Stunden referenzieren

## Stundenaufbau (45 Minuten)

Jede Trainingsstunde folgt diesem bewährten RehaSport-Schema:

| Phase | Dauer | Ziel |
|-------|-------|------|
| **Aufwärmen** | 10 Min | Körper aktivieren, Gelenke mobilisieren, Herz-Kreislauf vorbereiten |
| **Hauptteil** | 15 Min | Kraft und Ausdauer trainieren, funktionelle Bewegungen |
| **Schwerpunkt** | 15 Min | Themenspezifische Übungen, gezielte Rehabilitation |
| **Ausklang** | 10 Min | Dehnung, Entspannung, Regeneration |

## Anpassungsprinzipien

### Knieprobleme (häufig!)

- Keine tiefen Kniebeugen
- Begrenzte Belastung/Impact
- Stuhl als Stütze
- Beispiele: Sitzende Varianten, reduzierter Bewegungsumfang

### Schulterprobleme (häufig!)

- Begrenzte Überkopf-Bewegungen
- Reduzierte Arm-Hebel
- Keine Stützübungen mit vollem Gewicht
- Beispiele: Arme auf Schulterhöhe statt über Kopf

### Weitere Anpassungen

- **Balance-Probleme**: Stuhl/Wand als Unterstützung
- **Kardiovaskuläre Einschränkungen**: Intensität reduzieren, mehr Pausen
- **Rückenschmerzen**: Neutrale Wirbelsäule betonen, Core-Stabilität

## Tag-System

Für bessere Organisation und Filterung verwenden wir einheitliche Tags:

### Bereich-Tags

- `#aufwärmen` `#hauptteil` `#schwerpunkt` `#ausklang`

### Schwerpunkt-Tags

- `#kraft` `#ausdauer` `#beweglichkeit` `#koordination` `#balance`

### Anpassungs-Tags

- `#knie-freundlich` `#schulter-freundlich` `#anfänger` `#fortgeschritten` `#senioren`

### Zielgruppen-Tags

- `#orthopädie` `#herz-kreislauf` `#neurologie` `#allgemein`

## Best Practices

1. **Konsistenz**: Immer die Templates verwenden
2. **Vollständigkeit**: Alle Pflichtfelder ausfüllen, besonders Kontraindikationen
3. **Medizinische Sicherheit**: Kontraindikationen und Alternativen ernst nehmen
4. **Verlinkung**: Zusammenhänge durch Links dokumentieren
5. **Aktualität**: Datum der letzten Änderung pflegen
6. **Klarheit**: Einfache, verständliche Sprache für alle Teilnehmer

## Nächste Schritte

1. Lesen Sie [Übungen erstellen](übungen_erstellen.md)
2. Lesen Sie [Stunden planen](stunden_planen.md)
3. Lesen Sie [Alternative Übungen](alternative_übungen.md)
4. Beginnen Sie mit 10-15 Basis-Übungen
5. Erstellen Sie Ihre erste Beispielstunde

## Häufige Fragen

**Wie viele Übungen brauche ich für eine Stunde?**

- Typischerweise 8-12 Übungen (2-3 pro Phase)

**Muss ich für jede Übung Alternativen angeben?**

- Ja, mindestens für Knie- und Schulterprobleme

**Kann ich Übungen wiederverwenden?**

- Ja! Das ist der Sinn der Übungsdatenbank - einmal dokumentieren, mehrfach nutzen

**Wie detailliert sollen Übungsbeschreibungen sein?**

- So detailliert, dass ein Übungsleiter sie ohne Vorkenntnisse ausführen kann

---
**Letzte Aktualisierung**: 13.11.2025

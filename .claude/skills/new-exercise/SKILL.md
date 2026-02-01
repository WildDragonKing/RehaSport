---
name: new-exercise
description: Erstellt neue Übung mit Alternativen-Template (Knie/Schulter)
arguments:
  - name: exerciseName
    description: Name der Übung (z.B. Schulterkreisen)
  - name: phase
    description: Phase (warmup|main|focus|cooldown)
  - name: difficulty
    description: Schwierigkeit (leicht|mittel|schwer)
disable-model-invocation: true
---

# Neue Übung erstellen

Erstelle eine neue Übung im RehaSport-Format.

## 1. Datei erstellen

Erstelle `Übungen/{exerciseName}.md` mit folgendem Template:

```markdown
---
name: {exerciseName}
slug: {slug aus exerciseName, lowercase mit bindestrichen}
phase: {phase}
difficulty: {difficulty}
duration: 2-3
equipment: []
tags: []
---

# {exerciseName}

## Ausführung

1. Ausgangsposition beschreiben
2. Bewegungsablauf Schritt für Schritt
3. Atmung beachten

## Wiederholungen

- **Standard:** 10-12 Wiederholungen / 2-3 Sätze
- **Anfänger:** 8 Wiederholungen / 2 Sätze

## Alternativen

### Bei Knieproblemen

> Beschreibe eine schonende Alternative für Teilnehmer mit Kniebeschwerden.

### Bei Schulterproblemen

> Beschreibe eine schonende Alternative für Teilnehmer mit Schulterbeschwerden.

## Kontraindikationen

- **Absolut:** [Wann die Übung nicht ausgeführt werden sollte]
- **Relativ:** [Wann besondere Vorsicht geboten ist]

## Tipps

- Coaching-Hinweise für Trainer
- Häufige Fehler und Korrekturen
```

## 2. Validieren

Nach dem Erstellen:
```bash
cd /Users/lbuettge/Projects/personal/RehaSport && node scripts/validate-content.js --exercises
```

## 3. Checkliste

Stelle sicher dass:
- [ ] Knie-Alternative dokumentiert ist
- [ ] Schulter-Alternative dokumentiert ist
- [ ] Kontraindikationen vollständig sind
- [ ] Schwierigkeitsgrad zur Phase passt
- [ ] Zeitangabe realistisch ist (warmup: 1-2 min, main/focus: 2-4 min)

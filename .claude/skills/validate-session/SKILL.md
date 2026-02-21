---
name: validate-session
description: Prueft Trainingsstunde gegen 45-Min-Schema, therapeutische Vollstaendigkeit und Sicherheit. Trigger: "Session pruefen", "Stunde validieren", "validate session"
---

# Session-Validierung

Pruefe eine Trainingsstunde gegen die RehaSport-Qualitaetsstandards.

## Arguments
- `$ARGUMENTS` - Session-Slug, Kategorie-Slug oder "alle" fuer Komplett-Check

## Validierungsregeln

### 1. 45-Minuten-Schema (PFLICHT)
Jede Session muss 4 Phasen haben:

| Phase | Soll-Dauer | Toleranz |
|-------|-----------|----------|
| Aufwaermen | ~10 Min | 8-12 Min |
| Hauptteil | ~15 Min | 12-18 Min |
| Schwerpunkt | ~15 Min | 12-18 Min |
| Ausklang | ~5 Min | 3-7 Min |
| **Gesamt** | **45 Min** | **42-48 Min** |

### 2. Therapeutische Vollstaendigkeit (WICHTIG)
Jede Uebung (`SessionExercise`) sollte pruefen:
- [ ] `kneeAlternative` vorhanden (String, nicht leer)
- [ ] `shoulderAlternative` vorhanden (String, nicht leer)
- [ ] `difficulty` gesetzt (leicht, mittel, schwer)

### 3. Phasen-Konsistenz
- [ ] Phase "Aufwaermen" enthaelt keine Uebungen mit `difficulty: "schwer"`
- [ ] Phase "Ausklang" enthaelt nur leichte Uebungen oder Entspannung
- [ ] Schwierigkeitsgrad steigert sich sinnvoll (Aufwaermen < Hauptteil)

### 4. Strukturelle Korrektheit
- [ ] `title` vorhanden und nicht leer
- [ ] `description` vorhanden
- [ ] `phases` Array hat genau 4 Eintraege
- [ ] Jede Phase hat mindestens 1 Uebung
- [ ] `categorySlug` ist gesetzt

## Datenquellen

### Firestore (Produktion)
Sessions liegen in `sessions/{sessionId}` mit `phases: SessionPhase[]`.
Nutze das Firebase MCP oder `content.ts` zum Laden.

### Typen (Referenz)
Siehe `site/src/lib/types.ts`:
- `SessionDetail` - Komplette Session mit Phasen
- `SessionPhase` - Phase mit Uebungen
- `SessionExercise` - Einzeluebung mit Alternativen

## Ablauf

1. Lade die Session(s) ueber `site/src/lib/content.ts`
2. Pruefe jede Session gegen alle Regeln
3. Erstelle Bericht mit Severity-Levels

## Output Format

```
KRITISCH  Fehlende Phase - Session hat nur 3 Phasen statt 4
          Session: "Mobilisation Schulter" (mobilisation-schulter)

WICHTIG   Fehlende Knie-Alternative bei Uebung "Tiefe Kniebeuge"
          Session: "Kraft Unterkörper" (kraft-unterkoerper), Phase: Hauptteil

HINWEIS   Schwierigkeit nicht gesetzt bei "Armkreisen"
          Session: "Aufwaerm-Klassiker" (aufwaerm-klassiker), Phase: Aufwaermen
```

Severity:
- **KRITISCH** - Sicherheitsrisiko oder fehlende Pflichtstruktur
- **WICHTIG** - Therapeutische Vollstaendigkeit
- **HINWEIS** - Verbesserungsvorschlag

---
name: validate
description: Validiert Übungen und Stunden-Markdown auf Vollständigkeit
arguments:
  - name: type
    description: Optional - exercises, sessions, oder leer für beides
    required: false
---

# Content validieren

Validiere RehaSport-Content auf Vollständigkeit und korrekte Struktur.

## Ausführen

```bash
cd /Users/lbuettge/Projects/personal/RehaSport && npm run validate
```

Für spezifische Validierung:
- Nur Übungen: `npm run validate:exercises`
- Nur Stunden: `npm run validate:sessions`

## Bei Fehlern

Zeige die gefundenen Fehler und biete für jeden einen konkreten Fix an.

### Typische Fehler und Fixes

| Fehler | Fix |
|--------|-----|
| Fehlende Frontmatter-Felder | Füge fehlende Felder hinzu (name, slug, phase, difficulty) |
| Ungültige Phase | Korrigiere zu: warmup, main, focus, oder cooldown |
| Fehlende Alternativen | Ergänze Knie- und Schulter-Alternativen |
| Ungültiger Slug | Generiere aus Name: lowercase, Bindestriche statt Leerzeichen |

## Stunden-Schema prüfen

Jede Stunde muss dem 45-Minuten-Schema folgen:
- Aufwärmen: 10 Minuten
- Hauptteil: 15 Minuten
- Schwerpunkt: 15 Minuten
- Ausklang: 5 Minuten

Prüfe ob die Summe der Übungszeiten zum Schema passt.

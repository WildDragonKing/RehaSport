---
name: new-admin-page
description: Erstellt neue Astro-Seite mit BaseLayout und Design-Token-konformem Styling
arguments:
  - name: pageName
    description: Dateiname der Seite ohne Extension (z.B. berichte)
  - name: title
    description: Seitentitel fuer Browser-Tab (z.B. Berichte)
disable-model-invocation: true
---

# Neue Seite erstellen

Erstelle eine neue Astro-Seite nach dem bestehenden Pattern.

## 1. Seite erstellen

Erstelle `site/src/pages/{pageName}.astro`:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
---

<BaseLayout title="{title} · RehaSport" description="Beschreibung der Seite.">
  <section class="container section stack">
    <h1 class="section-title">{title}</h1>
    <p class="section-subtitle">
      Beschreibung hier einfuegen.
    </p>

    <article class="card stack">
      <h2>Ueberschrift</h2>
      <p>Inhalt hier...</p>
    </article>
  </section>
</BaseLayout>
```

## 2. Falls React-Island noetig

Wenn die Seite interaktive Komponenten braucht:

```astro
---
import BaseLayout from "../layouts/BaseLayout.astro";
import MeineKomponente from "../components/react/MeineKomponente.tsx";
---

<BaseLayout title="{title} · RehaSport" description="Beschreibung.">
  <section class="container section stack">
    <h1 class="section-title">{title}</h1>
    <MeineKomponente client:visible />
  </section>
</BaseLayout>
```

Hydration-Direktiven:
- `client:visible` - Standard fuer die meisten Komponenten (laedt erst beim Scrollen)
- `client:load` - Nur wenn sofort interaktiv sein muss
- `client:idle` - Laedt nach dem initialen Page Load

## Design-Tokens

Nutze ausschliesslich CSS Custom Properties aus `site/src/styles/global.css`:
- **Hintergrund:** `var(--bg)`, `var(--surface)`, `var(--surface-strong)`
- **Text:** `var(--text)`, `var(--text-muted)`
- **Rahmen:** `var(--border)`
- **Akzent:** `var(--accent)`, `var(--accent-strong)`
- **Abstaende:** `var(--space-1)` bis `var(--space-16)`
- **Ecken:** `var(--radius)`, `var(--radius-soft)`

## CSS-Klassen (bereits vorhanden)

- `.container` - Zentrierter Content mit max-width
- `.section` - Vertikaler Abstand
- `.stack` - Vertikales Spacing zwischen Kindern
- `.card` - Karte mit Rahmen und Hintergrund
- `.section-title` - Grosse Ueberschrift
- `.section-subtitle` - Untertitel in gedaempfter Farbe

## Schriften

- **Headlines:** `font-family: "Space Grotesk"` (automatisch via h1-h4)
- **Body:** `font-family: "IBM Plex Sans"` (automatisch via body)

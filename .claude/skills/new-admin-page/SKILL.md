---
name: new-admin-page
description: Erstellt neue Admin-Seite mit Dark Mode und Standard-Layout
arguments:
  - name: pageName
    description: Name der neuen Seite (z.B. ReportsPage)
  - name: navLabel
    description: Label für die Navigation (z.B. Berichte)
  - name: route
    description: URL-Pfad ohne /admin/ (z.B. berichte)
disable-model-invocation: true
---

# Neue Admin-Seite erstellen

Erstelle eine neue Admin-Seite mit folgendem Pattern:

## 1. Neue Seite erstellen

Erstelle `site/src/pages/admin/{pageName}.tsx`:

```tsx
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useContent } from '../../contexts/ContentContext';

export default function {pageName}(): JSX.Element {
  const { user } = useAuth();
  const { refresh } = useContent();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-sage-900 dark:text-sage-100">
            {navLabel}
          </h1>
          <p className="mt-2 text-sage-600 dark:text-sage-400">
            Beschreibung der Seite
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-sage-200 dark:border-gray-700 p-6">
        <p className="text-sage-600 dark:text-sage-400">Inhalt hier...</p>
      </div>
    </div>
  );
}
```

## 2. Route hinzufügen

In `site/src/App.tsx`:
- Lazy Import hinzufügen: `const {pageName} = lazy(() => import("./pages/admin/{pageName}"));`
- Route hinzufügen: `<Route path="{route}" element={<{pageName} />} />`

## 3. Navigation hinzufügen

In `site/src/components/layout/AdminLayout.tsx`:
- In `navItems` Array hinzufügen: `{ to: '/admin/{route}', label: '{navLabel}' }`

## Dark Mode Pattern

Alle Farben müssen Dark Mode Varianten haben:
- `bg-white dark:bg-gray-800`
- `bg-sage-50 dark:bg-gray-900`
- `text-sage-900 dark:text-sage-100`
- `text-sage-600 dark:text-sage-400`
- `border-sage-200 dark:border-gray-700`

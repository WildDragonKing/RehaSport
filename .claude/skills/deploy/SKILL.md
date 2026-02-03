---
name: deploy
description: Build und deploy zu Firebase (Functions + Hosting)
disable-model-invocation: true
---

# Deploy zu Firebase

Führe folgende Schritte aus:

1. **Site bauen:**
   ```bash
   cd /Users/lbuettge/Projects/personal/RehaSport/site && npm run build
   ```

2. **Zu Firebase deployen:**
   ```bash
   cd /Users/lbuettge/Projects/personal/RehaSport && npx firebase deploy
   ```

3. **Ergebnis melden:** Gib die Hosting-URL aus und bestätige den erfolgreichen Deploy.

Falls ein Build-Fehler auftritt, zeige die Fehlermeldung und biete an, das Problem zu beheben.

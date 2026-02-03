---
name: release
description: Create release PR from develop to main with version tag
disable-model-invocation: true
---

# Release Workflow

Create a release PR from develop to main.

## Arguments
- `$ARGUMENTS` - Version number (e.g., "1.2.0")

## Prerequisites Check

```bash
# Must be on develop branch
git branch --show-current  # Should be "develop"

# No uncommitted changes
git status --porcelain  # Should be empty
```

## Release Steps

### 1. Run Tests
```bash
cd site && npm test
```

### 2. TypeScript Check
```bash
cd site && npx tsc --noEmit
```

### 3. Build Verification
```bash
cd site && npm run build
```

### 4. Push Develop (if needed)
```bash
git push origin develop
```

### 5. Create Release PR
```bash
gh pr create --base main --head develop \
  --title "Release v$ARGUMENTS" \
  --body "## Release v$ARGUMENTS

### Changes
- [List main changes from commits]

### Verification
- [x] All tests passing
- [x] TypeScript compilation successful
- [x] Build successful

---
Generated with Claude Code"
```

### 6. After PR Merge (manual step)
```bash
git checkout main
git pull origin main
git tag -a "v$ARGUMENTS" -m "Release v$ARGUMENTS"
git push origin "v$ARGUMENTS"
git checkout develop
```

## Notes
- Direct push to main is blocked by branch protection
- PR triggers CodeQL scan before merge is allowed
- Firebase App Hosting auto-deploys after merge to main

---
name: gen-test
description: Generate Vitest tests for React components and hooks
disable-model-invocation: true
---

# Test Generator

Generate Vitest tests following project patterns.

## Arguments
- `$ARGUMENTS` - Path to component or hook to test

## Project Test Patterns

### Imports
```typescript
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
```

### Firebase Mocking
```typescript
vi.mock("../firebase/config", () => ({
  db: {},
  auth: {},
  functions: {},
}));
```

### ContentProvider Wrapper (for hooks)
```typescript
import { ContentProvider } from "../contexts/ContentContext";

vi.mock("../content/sessions-firestore", () => ({
  getCategories: vi.fn().mockResolvedValue([]),
  getAllSessions: vi.fn().mockResolvedValue([]),
}));

vi.mock("../content/exercises-firestore", () => ({
  getAllExercises: vi.fn().mockResolvedValue([]),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <ContentProvider>{children}</ContentProvider>;
}

// Usage:
const { result } = renderHook(() => useMyHook(), { wrapper });
```

### IntersectionObserver
Already mocked in `test/setup.ts` - no additional setup needed.

### Dark Mode Testing
```typescript
// Set dark mode
document.documentElement.setAttribute("data-theme", "dark");
```

## Instructions

1. Read the target file: `$ARGUMENTS`
2. Identify what to test (component, hook, utility)
3. Create test file at same location with `.test.tsx` extension
4. Follow patterns above
5. Run test to verify: `cd site && npx vitest run <test-file>`

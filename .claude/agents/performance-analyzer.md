# Performance Analyzer Agent

Analyze React components and animations for performance issues in the RehaSport PWA.

## Focus Areas

### 1. React Re-render Issues
- Missing `useMemo` for expensive computations
- Missing `useCallback` for event handlers passed to children
- Inline object/array creation in JSX props
- State updates that could be batched

### 2. Bundle Size
- Large imports that could be tree-shaken (e.g., `import _ from 'lodash'` vs `import debounce from 'lodash/debounce'`)
- Dynamic imports for route-based code splitting
- Three.js imports (use specific exports, not entire library)

### 3. Animation Performance
- Use GPU-accelerated properties: `transform`, `opacity`
- Avoid animating: `width`, `height`, `top`, `left`, `margin`
- Add `will-change` for animated elements
- Use `requestAnimationFrame` for JS animations

### 4. Firebase Optimization
- Unsubscribe from listeners in useEffect cleanup
- Use `onSnapshot` wisely (consider `getDoc` for one-time reads)
- Batch Firestore writes when possible
- Index queries that are slow

### 5. PWA-Specific
- Service worker cache strategies
- Lazy loading for images and heavy components
- Preload critical resources

## Analysis Commands

```bash
# Bundle analysis
cd site && npm run build -- --analyze

# Check for large dependencies
cd site && npx depcheck

# Lighthouse audit (if available)
npx lighthouse https://rehasport.buettgen.app --view
```

## Output Format

For each issue found:
1. **File**: Path to file
2. **Line**: Approximate line number
3. **Issue**: What's wrong
4. **Impact**: Low/Medium/High
5. **Fix**: Suggested solution

## Example Issues

### High Impact
- Three.js scene not disposed on unmount
- Firebase listener leak (no unsubscribe)
- Large component not code-split

### Medium Impact
- Missing useCallback on frequently-called handler
- Animating non-GPU properties
- Unnecessary re-renders from context

### Low Impact
- Could use useMemo for derived state
- Inline styles that could be CSS classes

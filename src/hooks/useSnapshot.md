# useSnapshot.ts – spec  
*(Hook nano-module · snapshot selector wrapper)*

---

## 1. Purpose

Provide React components with an **easy, memo-safe** way to grab a
`ParsedSnapshot` from the `metricsSlice` given its `snapshotId`.  
Hides Zustand selector boilerplate and returns `undefined` if not found.

---

## 2. Public API

```ts
// src/hooks/useSnapshot.ts
import type { ParsedSnapshot } from '@/contracts/types';

/**
 * Returns the ParsedSnapshot for the provided id (or undefined).
 *
 * React state updates when that snapshot object in the store changes
 * (identity comparison).
 */
export function useSnapshot(id: string | undefined | null): ParsedSnapshot | undefined;
```

## 3. Internal Implementation

```ts
import { useMetricsSlice } from '@/state/metricsSlice';
import { useStore }        from 'zustand';

export function useSnapshot(id?: string | null) {
  return useStore(useMetricsSlice, state =>
    id ? state.snapshots[id] : undefined
  );
}
```

Uses Zustand store directly; no re-render if other snapshots mutate.

Selector is identity-based — component re-renders only if the snapshot
object reference itself changes (e.g., snapshot removed/replaced).

## 4. Dependencies
metricsSlice.ts

React type imports only (hook itself is runtime).

## 5. Consumers
| Component / Hook | Why |
|------------------|-----|
| useInspectorProps.ts | needs snapshot to build props |
| MetricInstanceWidget | loads metric details |
| Dashboard | quick series counts (future) |

## 6. Tests

```ts
✓ returns undefined when id not set
✓ returns snapshot object when present
✓ re-renders only when that snapshot is replaced
```

Test with React Testing Library + Zustand test util.

## 7. Performance
Single selector, O(1). No extra allocations.
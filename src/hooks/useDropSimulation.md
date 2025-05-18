# useDropSimulation.ts – spec  
*(Hook nano-module · toggles "simulate drop" state for Inspector)*

---

## 1. Purpose

Hold **ephemeral UI state**: *"Which single attribute key is currently being
dropped for cardinality simulation?"*  
Lives outside global store to avoid unnecessary renders elsewhere—local to the
`MetricInstanceWidget` tree.

---

## 2. Public API

```ts
// src/hooks/useDropSimulation.ts
/**
 * Returns current droppedKey (string or null) AND a setter fn.
 *
 * Encapsulates React.useState + small helper logic.
 */
export function useDropSimulation(): [
  droppedKey: string | null,
  toggle    : (key: string | null) => void
];
```

## 3. Internal Implementation

```ts
import { useState, useCallback } from 'react';

export function useDropSimulation() {
  const [key, setKey] = useState<string | null>(null);

  const toggle = useCallback((next: string | null) => {
    setKey(prev => (prev === next ? null : next));
  }, []);

  return [key, toggle] as const;
}
```

Calling toggle(currentKey) again resets (untoggles).

## 4. Consumers
| Component | Why |
|-----------|-----|
| MetricInstanceWidget.tsx | passes droppedKey into metricProcessor options and toggles via Inspector callbacks |
| CardinalityCapsule organism | UI checkbox to drop/restore |

## 5. Interaction Contract
User clicks attribute row ⟶ selects focusedKey in Inspector.

User toggles "Simulate drop" checkbox.
Inspector calls onSimulateDrop(focusedKey, true|false).

Parent (MetricInstanceWidget) calls toggle(focusedKey) from this hook.

Effect re-runs getProcessedMetricInfo with {simulateDropAttributeKey:key}
and repasses updated props to Inspector.

## 6. Tests

```ts
✓ initial state null
✓ toggle('http.method') sets key
✓ toggle('http.method') again resets to null
✓ toggle('host.name') switches key
```

## 7. Scope & Persistence
Pure in-memory per component mount; resets when MetricInstanceWidget unmounts
(e.g., navigating to another metric).

## 8. Future Extension
If we allow multi‐key drop later, replace string | null with Set<string>
and update toggle semantics— current API remains iterable-friendly.
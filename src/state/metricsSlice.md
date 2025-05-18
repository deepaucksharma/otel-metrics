# metricsSlice.ts – spec  
*(Global State nano-module · stores ParsedSnapshots)*

---

## 1. Purpose

Hold all **loaded snapshots** (raw parsed data) plus a deterministic order,
while exposing simple CRUD actions and memoised selectors.  
No UI logic, no processing—pure data container.

---

## 2. Slice Shape

```ts
// interface MetricsSliceState
{
  snapshots    : Record<string, ParsedSnapshot>;   // keyed by snapshot.id
  snapshotOrder: string[];                         // insertion order
}

/* interface MetricsSliceActions */
addSnapshot     (snap: ParsedSnapshot)        => void
removeSnapshot  (id : string)                 => void
clearSnapshots  ()                            => void
```

Combined into Zustand store via immer middleware.

## 3. Public Selectors
Use helper functions; don't pass anonymous selectors to components—enables
future reselect optimisation.

```ts
selectSnapshotById(id: string)
selectAllSnapshots()              // in load order
selectSnapshotSummaries()         // {id,fileName,seriesCount}[]
```

seriesCount cached in a WeakMap to avoid recompute.

## 4. Implementation Sketch

```ts
import create from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ParsedSnapshot } from '@/contracts/types';

interface State {
  snapshots: Record<string, ParsedSnapshot>;
  snapshotOrder: string[];
}

interface Actions {
  addSnapshot(s: ParsedSnapshot): void;
  removeSnapshot(id: string): void;
  clearSnapshots(): void;
}

export const useMetricsSlice = create<State & Actions>()(
  immer((set, get) => ({
    snapshots: {},
    snapshotOrder: [],

    addSnapshot: (snap) => set(state => {
      state.snapshots[snap.id] = snap;
      if (!state.snapshotOrder.includes(snap.id))
        state.snapshotOrder.push(snap.id);
    }),

    removeSnapshot: (id) => set(state => {
      delete state.snapshots[id];
      state.snapshotOrder = state.snapshotOrder.filter(i => i !== id);
    }),

    clearSnapshots: () => set(state => {
      state.snapshots = {};
      state.snapshotOrder = [];
    })
  }))
);
```

## 5. Persistence
No localStorage—snapshots can be 10s of MB; reload is user-driven.
Slice resets on page refresh.

## 6. Event Bus Connections
eventBus.on('data.snapshot.loaded', ({snapshot}))
→ addSnapshot(snapshot)

eventBus.on('app.reset')
→ clearSnapshots()

Handled in a small side-effect module (services/eventListeners.ts).

## 7. Tests
| Test case | Expect |
|-----------|--------|
| addSnapshot stores & orders | selectSnapshotById(id) returns object |
| Duplicate addSnapshot | order unchanged, object overwritten |
| removeSnapshot | selector returns undefined |
| clearSnapshots | both maps empty |

## 8. Performance
Lookups O(1). Memory bounded by raw snapshot JSON already in worker result.

## 9. Future
If we support incremental diff between snapshots,
extra field processedCache: WeakMap<metricName, ProcessedMetricInfo> may live here, but not in v1.1.
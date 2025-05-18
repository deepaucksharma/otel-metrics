# eventListeners.ts – spec
*(Service nano-module · binds mitt events to Zustand)*

---

## 1. Purpose

Glues the **global mitt event bus** to our Zustand slices.  Subscribes
once on app startup and forwards bus events to the appropriate slice
methods so React components stay unaware of the bus.

---

## 2. Subscribed Events

| Event name | Payload | Slice action invoked |
|------------|---------|----------------------|
| `data.snapshot.loaded` | `{ snapshot: ParsedSnapshot }` | `metricsSlice.addSnapshot(snapshot)` |
| `app.reset` | none | `metricsSlice.clearSnapshots(); uiSlice.resetUi()` |
| `ui.metric.inspectRequest` | `{ metricName: string, snapshotId: string }` | `uiSlice.setActiveSnapshot(snapshotId)` + `uiSlice.inspectMetric(metricName)` |
| `ui.inspector.openRequest` | none | `uiSlice.openInspector()` |
| `ui.inspector.closeRequest` | none | `uiSlice.closeInspector()` |

---

## 3. Implementation Sketch

```ts
import mitt from 'mitt';
import { eventBus } from './eventBus';
import { useMetricsSlice } from '@/state/metricsSlice';
import { useUiSlice } from '@/state/uiSlice';

export function registerEventListeners() {
  const addSnapshot = useMetricsSlice.getState().addSnapshot;
  const clearSnapshots = useMetricsSlice.getState().clearSnapshots;
  const uiActions = useUiSlice.getState();

  eventBus.on('data.snapshot.loaded', ({ snapshot }) => {
    addSnapshot(snapshot);
  });

  eventBus.on('app.reset', () => {
    clearSnapshots();
    uiActions.resetUi();
  });

  eventBus.on('ui.metric.inspectRequest', ({ metricName, snapshotId }) => {
    uiActions.setActiveSnapshot(snapshotId);
    uiActions.inspectMetric(metricName);
  });

  eventBus.on('ui.inspector.openRequest', uiActions.openInspector);
  eventBus.on('ui.inspector.closeRequest', uiActions.closeInspector);
}
```

---

## 4. Usage

This module is imported **once** during application bootstrap
(e.g., in `src/index.tsx`).  Calling `registerEventListeners()` sets up
all subscriptions for the lifetime of the app.

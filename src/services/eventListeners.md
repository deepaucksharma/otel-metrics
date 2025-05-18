# eventListeners.ts – spec  
*(Service nano-module · connects event bus to global state)*

---

## 1. Purpose

Bridge between the **event bus** (mitt) and **state slices** (Zustand), enabling:

* Loose coupling between UI events and state updates
* Worker-to-main thread communication without direct slice imports
* Consistent event-driven architecture across components
* Thread crossing (WebWorker → main thread events → store)

This module sets up global listeners for all defined event types and maps them to appropriate state actions.

---

## 2. Event Type Definitions

```ts
// src/services/eventTypes.ts
export type EventTypes = {
  // Data events (worker → main)
  'data.snapshot.parsed': { snapshot: ParsedSnapshot };
  'data.snapshot.error': { error: Error, fileName: string };
  'data.snapshot.load.start': { fileName: string };
  
  // UI navigation events
  'ui.inspector.open': { 
    snapshotId: string;
    metricName: string;
    seriesKey: SeriesKey;
    pointId: number; 
  };
  'ui.inspector.close': void;
  'ui.metric.inspect': { 
    snapshotId: string;
    metricName: string;
  };
  
  // Navigation event types can be expanded here
};
```

## 3. Main Implementation

```ts
// src/services/eventListeners.ts
import { eventBus } from './eventBus';
import { useMetricsSlice } from '@/state/metricsSlice';
import { useUiSlice } from '@/state/uiSlice';
import type { EventTypes } from './eventTypes';

/**
 * Sets up global event listeners that connect events to store actions.
 * Call once at app initialization.
 */
export function registerEventListeners(): () => void {
  const metricsActions = useMetricsSlice.getState();
  const uiActions = useUiSlice.getState();
  
  // Data events
  eventBus.on('data.snapshot.parsed', (payload) => {
    metricsActions.addSnapshot(payload.snapshot);
  });
  
  eventBus.on('data.snapshot.error', (payload) => {
    metricsActions.registerError(payload.fileName, payload.error);
  });
  
  eventBus.on('data.snapshot.load.start', (payload) => {
    metricsActions.markLoading(payload.fileName);
  });
  
  // UI events
  eventBus.on('ui.inspector.open', (payload) => {
    // Set all context first
    uiActions.setActiveSnapshot(payload.snapshotId);
    uiActions.inspectMetric(payload.metricName);
    uiActions.inspectSeriesAndPoint(payload.seriesKey, payload.pointId);
    // Then open inspector
    uiActions.openInspector();
  });
  
  eventBus.on('ui.inspector.close', () => {
    uiActions.closeInspector();
  });
  
  eventBus.on('ui.metric.inspect', (payload) => {
    uiActions.setActiveSnapshot(payload.snapshotId);
    uiActions.inspectMetric(payload.metricName);
  });
  
  // Return cleanup function
  return () => {
    eventBus.off('*');
  };
}
```

## 4. Usage in App

```tsx
// src/App.tsx or similar entry point
import { useEffect } from 'react';
import { registerEventListeners } from '@/services/eventListeners';

function App() {
  useEffect(() => {
    // Register all global event listeners once on mount
    const unregister = registerEventListeners();
    
    // Clean up on unmount
    return unregister;
  }, []);
  
  return (
    // App components
  );
}
```

## 5. Event Usage Pattern

Components/services emit events without direct store dependencies:

```ts
// Example: In the worker message handler
import { eventBus } from '@/services/eventBus';

function handleWorkerMessage(data: WorkerMessage) {
  if (data.type === 'SNAPSHOT_PARSED') {
    eventBus.emit('data.snapshot.parsed', { 
      snapshot: data.payload 
    });
  } else if (data.type === 'PARSE_ERROR') {
    eventBus.emit('data.snapshot.error', {
      fileName: data.fileName,
      error: new Error(data.errorMessage)
    });
  }
}
```

## 6. Worker-Store Bridge

```
┌────────────────┐    postMessage    ┌────────────────┐
│                │                   │                │
│  Parser Worker │ ─────────────────▶│ Main Thread    │
│                │                   │                │
└────────────────┘                   └────────┬───────┘
                                              │
                                              │ dispatchToWorker.ts:handleMessage()
                                              │
                                              ▼
                                     ┌────────────────┐
                                     │                │
                                     │    Event Bus   │
                                     │                │
                                     └────────┬───────┘
                                              │
                                              │ eventListeners.ts
                                              │
                                              ▼
                                     ┌────────────────┐
                                     │                │
                                     │  State Slices  │
                                     │                │
                                     └────────────────┘
```

## 7. Actions Mapping Table

| Event Type | Slice Actions Called |
|------------|---------------------|
| data.snapshot.parsed | metricsSlice.addSnapshot |
| data.snapshot.error | metricsSlice.registerError |
| data.snapshot.load.start | metricsSlice.markLoading |
| ui.inspector.open | uiSlice.setActiveSnapshot, uiSlice.inspectMetric, uiSlice.inspectSeriesAndPoint, uiSlice.openInspector |
| ui.inspector.close | uiSlice.closeInspector |
| ui.metric.inspect | uiSlice.setActiveSnapshot, uiSlice.inspectMetric |

## 8. Event Bus Implementation

Note that this module depends on the event bus implementation, which is a thin wrapper around mitt:

```ts
// src/services/eventBus.ts
import mitt from 'mitt';
import type { EventTypes } from './eventTypes';

export const eventBus = mitt<EventTypes>();
```

## 9. Adding New Events

To add new events to the system:

1. Add type definition to `EventTypes` in eventTypes.ts
2. Add handler in registerEventListeners
3. Use eventBus.emit in appropriate component/service

## 10. Integration with toggleSimDrop

To address the identified gap with toggleSimDrop, add the following to uiSlice.md actions:

```ts
interface UiSliceActions {
  // ... existing actions
  
  /**
   * Toggle simulation of dropping an attribute for cardinality analysis.
   * @param key The attribute key to toggle
   * @param drop True to simulate dropping, false to restore
   */
  toggleSimDrop(key: string, drop: boolean): void;
}
```

And add corresponding handler to eventListeners.ts:

```ts
// Add to eventTypes.ts
'ui.cardinality.simulateDrop': { key: string, drop: boolean };

// Add to eventListeners.ts
eventBus.on('ui.cardinality.simulateDrop', (payload) => {
  uiActions.toggleSimDrop(payload.key, payload.drop);
});
```

## 11. Testing

```ts
✓ registers listeners for all defined event types
✓ data.snapshot.parsed calls metricsSlice.addSnapshot with correct payload
✓ ui.inspector.open calls all required actions in correct order 
✓ cleanup function unregisters all listeners
✓ actions are called with the exact event payload values
```

## 12. Performance Considerations

- Zustand actions are called directly with getState() to avoid React re-renders in the listeners
- Event emission and handling should be minimal overhead (<1ms)
- Action functions handle the heavy state updates, not the event listeners
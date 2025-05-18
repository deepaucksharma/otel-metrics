# eventBus.ts – spec
*(Service nano-module · global mitt bus)*

---

## 1. Purpose

Provide a **central event channel** so that data loaders, state slices and UI components can communicate without direct imports. Built on the tiny [`mitt`](https://github.com/developit/mitt) emitter.

---

## 2. Initialization

```ts
// src/services/eventBus.ts
import mitt from 'mitt';
import type { ParsedSnapshot } from '@/contracts/types';

export type EventMap = {
  'data.snapshot.loading': { fileId: string; fileName: string };
  'data.snapshot.loaded': { snapshot: ParsedSnapshot };
  'data.error': { message: string; error?: unknown };
  'ui.metric.inspectRequest': { metricName: string; snapshotId: string };
  'ui.inspector.openRequest': void;
  'app.reset': void;
};

export const bus = mitt<EventMap>();
export type EventBus = typeof bus;
```

`bus` is a singleton instance exported to all layers.

---

## 3. Standard Events

| Event name | Payload | Fired by |
|------------|--------|---------|
| `data.snapshot.loading` | `{ fileId, fileName }` | `StaticFileProvider` while reading a file |
| `data.snapshot.loaded` | `{ snapshot }` | Parser worker resolves successfully |
| `data.error` | `{ message, error? }` | Any loader or worker failure |
| `data.snapshot.progress` | `{ snapshotId, progress }` | (future) dispatchToWorker back-pressure metric |
| `ui.metric.inspectRequest` | `{ metricName, snapshotId }` | Metric widgets requesting inspection |
| `ui.inspector.openRequest` | `void` | Open the Inspector drawer |
| `app.reset` | `void` | Global "clear state" command |

Every payload shape lives in `src/contracts/types.ts`.

---

## 4. Usage Examples

### Listening in state modules

```ts
// metricsSlice.ts side-effects
bus.on('data.snapshot.loaded', ({ snapshot }) => {
  addSnapshot(snapshot);
});

bus.on('app.reset', () => clearSnapshots());
```

### Emitting from a component

```ts
// StaticFileProvider.tsx
bus.emit('data.snapshot.loading', { fileId: id, fileName: file.name });
```

---

## 5. Testing

Tests use a `busMock` helper which returns the same `EventBus` API backed by Jest mock functions. Import `busMock` inside unit tests to assert emissions without touching the real singleton.


# eventBus.ts – spec
*(Service nano-module · typed event emitter)*

---

## 1. Purpose

Provide a single **global event bus** so data and UI modules can communicate
without direct dependencies. Built on the tiny `mitt` emitter.

---

## 2. Public API

```ts
// src/services/eventBus.ts
import mitt from 'mitt';
import type { ParsedSnapshot } from '@/contracts/types';

export type BusEvents = {
  'data.snapshot.loading': { fileId: string; fileName: string };
  'data.snapshot.progress': { snapshotId: string; progress: number };
  'data.snapshot.loaded': { snapshot: ParsedSnapshot };
  'data.error': {
    snapshotId?: string;
    fileName?: string;
    message: string;
    detail?: string;
  };
  'ui.metric.inspectRequest': { metricName: string; snapshotId: string };
  'app.reset': void;
};

export const bus = mitt<BusEvents>();
export const emit = bus.emit;
export const on = bus.on;
export const off = bus.off;
```

---

## 3. Event Payloads

| Event | Payload | Purpose |
|-------|---------|---------|
| `data.snapshot.loading` | `{ fileId: string; fileName: string }` | User selected a file; begin load & parse |
| `data.snapshot.progress` | `{ snapshotId: string; progress: number }` | Periodic progress for long-running imports (`progress` 0-1) |
| `data.snapshot.loaded`  | `{ snapshot: ParsedSnapshot }` | Snapshot successfully parsed |
| `data.error` | `{ snapshotId?: string; fileName?: string; message: string; detail?: string }` | Any validation or parser failure |
| `ui.metric.inspectRequest` | `{ metricName: string; snapshotId: string }` | Focus inspector on metric |
| `app.reset` | `void` | Clear all state and workers |

---

## 4. Usage

Data loaders emit `data.snapshot.loading` and eventually `data.snapshot.loaded`.
When processing very large files, `dispatchToWorker.ts` can also emit
`data.snapshot.progress` as chunks finish to let the UI show a progress bar or
keep the user informed. Consumers should treat `progress` as a value between `0`
and `1`.

---

# dispatchToWorker.ts – spec  
*(Data-Provider nano-module · ≈ 70 LoC)*

---

## 1. Purpose

Create and manage a **micro-pool of Web Workers** that run
`parser.worker.ts`, then expose a *promise-based* API:

* **`dispatch(task)`** → returns a `Promise` that resolves with either
  `ParsedSnapshot` or a `ParserError` object.
* Pool size defaults to `min(cpu-cores-1, 4)`; workers are reused.
* Provides **`terminateAll()`** for app shutdown / hot reload.

---

## 2. Public API

```ts
// src/data/dispatchToWorker.ts
import type { ParsedSnapshot } from '@/contracts/types';

export interface ParseTask {
  snapshotId : string;
  fileName   : string;
  rawJson    : string;
}

export interface ParserErrorPayload {
  snapshotId: string;
  fileName  : string;
  message   : string;
  detail?   : string;
}

export type WorkerSuccess = { type: 'parsedSnapshot'; payload: ParsedSnapshot };
export type WorkerFailure = { type: 'parserError';   payload: ParserErrorPayload };

export function dispatchToParserWorker(
  task: ParseTask
): Promise<WorkerSuccess | WorkerFailure>;

export function terminateAllParserWorkers(): void;
```

Promises never reject—errors come back as {type:'parserError', …} so
UI code can route everything through a single channel.

## 3. Internal Mechanics
Global singleton state:

```ts
const workers: Worker[]          = [];
const inFlight = new Map<string, { resolve, reject }>();
let  rr = 0;  // round-robin index
```

Pool creation

```
poolSize = navigator.hardwareConcurrency
           ? clamp(1, 4, cores-1)
           : 2;
for (i = 0; i < poolSize; i++)
    workers[i] = new Worker(new URL('../logic/workers/parser.worker.ts', import.meta.url), { type:'module' });
```

Dispatch flow

```
taskId  ← crypto.randomUUID()
inFlight.set(taskId, {resolve})
workers[rr].postMessage({ ...task, taskId })
rr = (rr + 1) % poolSize
```

Worker listener (attached once per worker)

```ts
worker.onmessage = e => {
  const { taskId, ...rest } = e.data;
  inFlight.get(taskId)?.resolve(rest);   // Success OR parserError
  inFlight.delete(taskId);
}
worker.onerror = err => console.error('Worker crash', err);
```

terminateAll()

```ts
workers.forEach(w => w.terminate());
workers.length = 0;
inFlight.clear();
```

## 4. Dependencies
parser.worker.ts bundle path (Vite's new URL pattern).

No runtime third-party libs.

## 5. Consumers
StaticFileProvider.tsx – validates+reads file then dispatch().

Potential future bulk-import UI.

## 6. Tests
Mock Worker (jest-worker-mock):

✓ resolves with ParsedSnapshot payload.

✓ returns parserError on worker error.

✓ round-robin uses all workers.

✓ terminateAll() kills and clears state.

## 7. Performance
| Scenario | Target |
|----------|--------|
| 4 × 25 MB files, quad-core CPU | UI thread never blocks; all 4 workers busy. |
| Over-dispatch (> pool size) | FIFO queue via Promise → inFlight; memory stable. |

Fail CI perf if average dispatch latency > 100 ms after worker ready.

## 8. Future Enhancements
Back-pressure queue length metric → emit data.snapshot.progress.

Dynamic pool resize based on file count.
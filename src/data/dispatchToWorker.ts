/**
 * @layer Data Provider
 * @summary TODO
 *
 * ## Purpose
 *
 * TODO
 *
 * ## Algorithm/Visual
 *
 * TODO
 *
 * @perfBudget TODO
 * @loc_estimate TODO
 */


/**
 * Create and manage a micro‑pool of Web Workers running `parser.worker.ts` and expose a promise-based API.
 *
 * @remarks
 * Algorithm: maintain a singleton array of workers and dispatch tasks in round-robin.
 * Dependencies: browser `Worker`, `crypto.randomUUID`, `parser.worker.ts` bundle path.
 * Consumers: StaticFileProvider and future bulk-import features.
 * Tests: mocked Worker to validate success, failure, round-robin, and termination.
 * Future work: queue length metrics and dynamic pool sizing.
 */

import type { ParsedSnapshot } from '@/contracts/types';

export interface ParseTask {
  snapshotId: string;
  fileName: string;
  rawJson: string;
}

export interface ParserErrorPayload {
  snapshotId: string;
  fileName: string;
  message: string;
  detail?: string;
}

export type WorkerSuccess = {
  type: 'parsedSnapshot';
  payload: ParsedSnapshot;
};

export type WorkerFailure = {
  type: 'parserError';
  payload: ParserErrorPayload;
};

const workers: Worker[] = [];
const inFlight = new Map<string, { resolve: (r: WorkerSuccess | WorkerFailure) => void }>();
let rr = 0;
let poolSize = 0;

function ensurePool() {
  if (workers.length) return;
  const cores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 2;
  poolSize = Math.min(4, Math.max(1, cores - 1));
  for (let i = 0; i < poolSize; i += 1) {
    const worker = new Worker(new URL('../logic/workers/parser.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<any>) => {
      const { taskId, ...rest } = e.data;
      const entry = inFlight.get(taskId);
      entry?.resolve(rest);
      inFlight.delete(taskId);
    };
    worker.onerror = (err) => {
      console.error('Worker crash', err);
    };
    workers.push(worker);
  }
}

/**
 * Dispatch parsing work to the next available worker.
 *
 * @param task - Snapshot parsing task.
 * @returns Promise resolving with the worker result or parser error.
 */
export function dispatchToParserWorker(task: ParseTask): Promise<WorkerSuccess | WorkerFailure> {
  ensurePool();
  return new Promise((resolve) => {
    const taskId = crypto.randomUUID();
    inFlight.set(taskId, { resolve });
    const worker = workers[rr];
    worker.postMessage({ taskId, type: 'parse', payload: task });
    rr = (rr + 1) % poolSize;
  });
}

/**
 * Terminate all active parser workers and clear state.
 *
 * @remarks
 * Used during application teardown or hot reloads.
 */
export function terminateAllParserWorkers(): void {
  workers.forEach((w) => w.terminate());
  workers.length = 0;
  inFlight.clear();
}


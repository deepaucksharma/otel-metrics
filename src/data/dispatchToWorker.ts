
/**
 * Create and manage a micro‑pool of Web Workers running `parser.worker.ts` and expose a promise-based API.
 *
 * @remarks
 * Algorithm: maintain a singleton array of workers and dispatch tasks in round-robin.
 * Dependencies: browser `Worker`, {@link randomId}, `parser.worker.ts` bundle path.
 * Consumers: StaticFileProvider and future bulk-import features.
 * Tests: mocked Worker to validate success, failure, round-robin, and termination.
 * Future work: queue length metrics and dynamic pool sizing.
 */

import type { ParsedSnapshot } from '@/contracts/types';
import { jsonSafeParse } from '@/logic/workers/utils/jsonSafeParse';
import { mapToParsedSnapshot } from '@/logic/workers/mapping/otlpMapper';
import type { RawOtlpExportMetricsServiceRequest } from '@/contracts/rawOtlpTypes';
import { randomId } from '@/utils/randomId';

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

const workerSupported = (() => {
  try {
    return (
      typeof Worker !== 'undefined' &&
      typeof URL !== 'undefined' &&
      typeof import.meta.url === 'string'
    );
  } catch {
    return false;
  }
})();

const workers: Worker[] = [];
const inFlight = new Map<
  string,
  {
    resolve: (r: WorkerSuccess | WorkerFailure) => void;
    worker: Worker;
    task: ParseTask;
  }
>();
let rr = 0;
let poolSize = 0;

async function parseSynchronously(task: ParseTask): Promise<WorkerSuccess | WorkerFailure> {
  const parsed = jsonSafeParse<RawOtlpExportMetricsServiceRequest>(task.rawJson);
  if (parsed.type === 'left') {
    return {
      type: 'parserError',
      payload: {
        snapshotId: task.snapshotId,
        fileName: task.fileName,
        message: `JSON parsing failed: ${parsed.value.message}`,
        detail: parsed.value.stack,
      },
    };
  }

  try {
    const snapshot = mapToParsedSnapshot(parsed.value, task.snapshotId, task.fileName);
    return { type: 'parsedSnapshot', payload: snapshot };
  } catch (err: any) {
    const error = err instanceof Error ? err : new Error(String(err));
    return {
      type: 'parserError',
      payload: {
        snapshotId: task.snapshotId,
        fileName: task.fileName,
        message: `OTLP mapping failed: ${error.message}`,
        detail: error.stack,
      },
    };
  }
}

function ensurePool() {
  if (!workerSupported) return;
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
      for (const [taskId, entry] of Array.from(inFlight.entries())) {
        if (entry.worker === worker) {
          entry.resolve({
            type: 'parserError',
            payload: {
              snapshotId: entry.task.snapshotId,
              fileName: entry.task.fileName,
              message: 'Worker crashed',
            },
          });
          inFlight.delete(taskId);
        }
      }
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
  if (!workerSupported) {
    return parseSynchronously(task);
  }
  ensurePool();
  return new Promise((resolve) => {
    const taskId = randomId();
    const worker = workers[rr];
    inFlight.set(taskId, { resolve, worker, task });
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
  if (!workerSupported) return;
  workers.forEach((w) => w.terminate());
  workers.length = 0;
  inFlight.clear();
}


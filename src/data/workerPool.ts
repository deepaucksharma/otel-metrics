import { bus } from '@/services/eventBus';
import { removeCanceledTask, isTaskCanceled } from './parserCancellation';
import type {
  ParseTask,
  WorkerFailure,
  WorkerSuccess,
  WorkerProgress,
  ProgressPayload,
} from './parserTypes';

export const workerSupported = (() => {
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

export const workers: Worker[] = [];
export const inFlight = new Map<
  string,
  {
    resolve: (r: WorkerSuccess | WorkerFailure) => void;
    reject: (reason: any) => void;
    worker: Worker;
    task: ParseTask;
    canceled: boolean;
    progressInterval?: number;
  }
>();

let rr = 0;
let poolSize = 0;

export function nextWorker(): Worker {
  const w = workers[rr];
  rr = (rr + 1) % poolSize;
  return w;
}

export function emitProgress(
  taskId: string,
  fileName: string,
  progress: number,
  stage: ProgressPayload['stage'],
): void {
  if (isTaskCanceled(taskId)) return;

  const progressEvent: WorkerProgress = {
    type: 'parserProgress',
    payload: { taskId, fileName, progress, stage },
  };
  bus.emit('data.snapshot.load.progress', progressEvent.payload);
}

export function ensurePool(): void {
  if (!workerSupported) return;
  if (workers.length) return;
  const cores =
    typeof navigator !== 'undefined' && navigator.hardwareConcurrency
      ? navigator.hardwareConcurrency
      : 2;
  poolSize = Math.min(4, Math.max(1, cores - 1));
  for (let i = 0; i < poolSize; i += 1) {
    const worker = new Worker(
      new URL('../logic/workers/parser.worker.ts', import.meta.url),
      { type: 'module' },
    );
    worker.onmessage = (e: MessageEvent<any>) => {
      const { taskId, type, ...data } = e.data;
      const entry = inFlight.get(taskId);
      if (!entry) return;
      if (type === 'progress') {
        const p = data as ProgressPayload;
        emitProgress(taskId, p.fileName, p.progress, p.stage);
        return;
      }
      if (entry.progressInterval) {
        clearInterval(entry.progressInterval);
      }
      if (!entry.canceled) {
        entry.resolve({ ...data, taskId });
      }
      inFlight.delete(taskId);
      removeCanceledTask(taskId);
    };

    worker.onerror = (err) => {
      console.error('Worker crash', err);
      for (const [taskId, entry] of Array.from(inFlight.entries())) {
        if (entry.worker === worker) {
          if (entry.progressInterval) {
            clearInterval(entry.progressInterval);
          }
          if (!entry.canceled) {
            entry.resolve({
              type: 'parserError',
              payload: {
                snapshotId: entry.task.snapshotId,
                fileName: entry.task.fileName,
                taskId,
                message: 'Worker crashed',
                detail: err?.message || 'Unknown worker error',
              },
            });
          }
          inFlight.delete(taskId);
          removeCanceledTask(taskId);
        }
      }
    };

    workers.push(worker);
  }
}

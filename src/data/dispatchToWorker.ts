
/**
 * Create and manage a micro‑pool of Web Workers running `parser.worker.ts` and expose a promise-based API.
 *
 * @purpose Orchestrate parallel parsing of OTLP data across worker threads with progress tracking.
 * @algorithm
 * 1. Maintain a singleton pool of workers and dispatch tasks in round-robin fashion.
 * 2. Track progress for each task and emit progress events at regular intervals.
 * 3. Support task cancellation to abort parsing operations.
 * 4. Provide synchronous fallback when workers are not supported.
 * 
 * Dependencies: browser `Worker`, `crypto.randomUUID`, `parser.worker.ts` bundle path.
 * Consumers: StaticFileProvider and future bulk-import features.
 * Tests: mocked Worker to validate success, failure, round-robin, and termination.
 */

import type { ParsedSnapshot } from '@/contracts/types';
import { jsonSafeParse } from '@/logic/workers/utils/jsonSafeParse';
import { mapToParsedSnapshot } from '@/logic/workers/mapping/otlpMapper';
import type { RawOtlpExportMetricsServiceRequest } from '@/contracts/rawOtlpTypes';
import { bus } from '@/services/eventBus';

export interface ParseTask {
  snapshotId: string;
  fileName: string;
  rawJson: string;
  fileSize: number;
}

export interface ParserErrorPayload {
  snapshotId: string;
  fileName: string;
  taskId: string;
  message: string;
  detail?: string;
}

export interface ProgressPayload {
  taskId: string;
  fileName: string;
  progress: number;
  stage: 'parsing' | 'mapping' | 'processing';
}

export type WorkerSuccess = {
  type: 'parsedSnapshot';
  payload: ParsedSnapshot;
  taskId: string;
};

export type WorkerFailure = {
  type: 'parserError';
  payload: ParserErrorPayload;
};

export type WorkerProgress = {
  type: 'parserProgress';
  payload: ProgressPayload;
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
    reject: (reason: any) => void;
    worker: Worker;
    task: ParseTask;
    canceled: boolean;
    progressInterval?: number;
  }
>();
let rr = 0;
let poolSize = 0;

// List of taskIds that have been canceled but not yet completed
const canceledTasks = new Set<string>();

async function parseSynchronously(taskId: string, task: ParseTask): Promise<WorkerSuccess | WorkerFailure> {
  // Emit initial progress
  emitProgress(taskId, task.fileName, 0, 'parsing');
  
  // Check for cancellation
  if (canceledTasks.has(taskId)) {
    throw new Error('Task canceled');
  }
  
  // Parse JSON (about 33% of the work)
  const parsed = jsonSafeParse<RawOtlpExportMetricsServiceRequest>(task.rawJson);
  emitProgress(taskId, task.fileName, 33, 'parsing');
  
  if (parsed.type === 'left') {
    return {
      type: 'parserError',
      payload: {
        snapshotId: task.snapshotId,
        fileName: task.fileName,
        taskId,
        message: `JSON parsing failed: ${parsed.value.message}`,
        detail: parsed.value.stack,
      },
    };
  }

  // Check for cancellation again
  if (canceledTasks.has(taskId)) {
    throw new Error('Task canceled');
  }
  
  emitProgress(taskId, task.fileName, 50, 'mapping');
  
  try {
    // Map to internal structure (another 33%)
    const snapshot = mapToParsedSnapshot(parsed.value, task.snapshotId, task.fileName);
    
    // Final processing and validation (remaining 34%)
    emitProgress(taskId, task.fileName, 90, 'processing');
    
    // Check for cancellation one last time
    if (canceledTasks.has(taskId)) {
      throw new Error('Task canceled');
    }
    
    // Complete
    emitProgress(taskId, task.fileName, 100, 'processing');
    
    return { 
      type: 'parsedSnapshot', 
      payload: snapshot,
      taskId
    };
  } catch (err: any) {
    const error = err instanceof Error ? err : new Error(String(err));
    return {
      type: 'parserError',
      payload: {
        snapshotId: task.snapshotId,
        fileName: task.fileName,
        taskId,
        message: `OTLP mapping failed: ${error.message}`,
        detail: error.stack,
      },
    };
  }
}

function emitProgress(taskId: string, fileName: string, progress: number, stage: ProgressPayload['stage']) {
  // Don't emit progress for canceled tasks
  if (canceledTasks.has(taskId)) return;
  
  const progressEvent: WorkerProgress = {
    type: 'parserProgress',
    payload: {
      taskId,
      fileName,
      progress,
      stage
    }
  };
  
  // Emit to event bus
  bus.emit('data.snapshot.load.progress', progressEvent.payload);
}

function ensurePool() {
  if (!workerSupported) return;
  if (workers.length) return;
  const cores = typeof navigator !== 'undefined' && navigator.hardwareConcurrency ? navigator.hardwareConcurrency : 2;
  poolSize = Math.min(4, Math.max(1, cores - 1));
  for (let i = 0; i < poolSize; i += 1) {
    const worker = new Worker(new URL('../logic/workers/parser.worker.ts', import.meta.url), { type: 'module' });
    worker.onmessage = (e: MessageEvent<any>) => {
      const { taskId, type, ...data } = e.data;
      const entry = inFlight.get(taskId);
      
      if (!entry) return; // Task may have been canceled
      
      // Handle progress updates
      if (type === 'progress') {
        const progressData = data as ProgressPayload;
        emitProgress(taskId, progressData.fileName, progressData.progress, progressData.stage);
        return;
      }
      
      // Clear the progress interval if it exists
      if (entry.progressInterval) {
        clearInterval(entry.progressInterval);
      }
      
      // Handle task completion
      if (!entry.canceled) {
        entry.resolve({ ...data, taskId });
      }
      
      inFlight.delete(taskId);
      canceledTasks.delete(taskId);
    };
    
    worker.onerror = (err) => {
      console.error('Worker crash', err);
      for (const [taskId, entry] of Array.from(inFlight.entries())) {
        if (entry.worker === worker) {
          // Clear the progress interval if it exists
          if (entry.progressInterval) {
            clearInterval(entry.progressInterval);
          }
          
          // Only resolve if the task hasn't been canceled
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
          canceledTasks.delete(taskId);
        }
      }
    };
    
    workers.push(worker);
  }
}

/**
 * Dispatch parsing work to the next available worker with progress tracking.
 *
 * @param task - Snapshot parsing task.
 * @returns Promise resolving with the worker result or parser error.
 * @throws Error if the task is canceled before completion.
 */
export function dispatchToParserWorker(task: ParseTask): Promise<WorkerSuccess | WorkerFailure> {
  const taskId = crypto.randomUUID();
  
  // Report initial load event
  bus.emit('data.snapshot.load.start', { fileName: task.fileName, fileSize: task.fileSize });
  
  if (!workerSupported) {
    return parseSynchronously(taskId, task);
  }
  
  ensurePool();
  
  return new Promise((resolve, reject) => {
    const worker = workers[rr];
    const entry = { 
      resolve, 
      reject, 
      worker, 
      task, 
      canceled: false,
    };
    
    // Setup periodic progress pings for large files
    if (task.fileSize > 5 * 1024 * 1024) { // 5MB+ gets progress updates
      entry.progressInterval = setInterval(() => {
        worker.postMessage({ taskId, type: 'pingProgress' });
      }, 500) as unknown as number;
    }
    
    inFlight.set(taskId, entry);
    worker.postMessage({ taskId, type: 'parse', payload: task });
    rr = (rr + 1) % poolSize;
  });
}

/**
 * Cancel a parsing task that is in progress.
 * 
 * @param taskId - The ID of the task to cancel.
 * @returns True if the task was found and canceled, false otherwise.
 */
export function cancelParserTask(taskId: string): boolean {
  const entry = inFlight.get(taskId);
  
  if (!entry) return false;
  
  canceledTasks.add(taskId);
  entry.canceled = true;
  
  // Clear progress interval if it exists
  if (entry.progressInterval) {
    clearInterval(entry.progressInterval);
    entry.progressInterval = undefined;
  }
  
  // Notify worker to stop processing (it may ignore this if already done)
  entry.worker.postMessage({ taskId, type: 'cancel' });
  
  // Emit cancellation event
  bus.emit('data.snapshot.load.cancel', { 
    fileName: entry.task.fileName, 
    taskId 
  });
  
  // Reject the promise
  entry.reject(new Error('Task canceled'));
  
  // Keep the entry in inFlight until the worker acknowledges cancellation
  return true;
}

/**
 * Terminate all active parser workers and clear state.
 *
 * @remarks
 * Used during application teardown or hot reloads.
 */
export function terminateAllParserWorkers(): void {
  if (!workerSupported) return;
  
  // Cancel all in-flight tasks
  for (const [taskId, entry] of inFlight.entries()) {
    if (entry.progressInterval) {
      clearInterval(entry.progressInterval);
    }
    entry.canceled = true;
    entry.reject(new Error('Worker terminated'));
  }
  
  // Terminate all workers
  workers.forEach((w) => w.terminate());
  workers.length = 0;
  
  // Clear state
  inFlight.clear();
  canceledTasks.clear();
}


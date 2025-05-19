import { bus } from '@/services/eventBus';
import { inFlight, workers, workerSupported } from './workerPool';
import type { ParseTask } from './parserTypes';

const canceledTasks = new Set<string>();

export function isTaskCanceled(taskId: string): boolean {
  return canceledTasks.has(taskId);
}

export function removeCanceledTask(taskId: string): void {
  canceledTasks.delete(taskId);
}

function markTaskCanceled(taskId: string): void {
  canceledTasks.add(taskId);
}

export function cancelParserTask(taskId: string): boolean {
  const entry = inFlight.get(taskId);
  if (!entry) return false;

  markTaskCanceled(taskId);
  entry.canceled = true;

  if (entry.progressInterval) {
    clearInterval(entry.progressInterval);
    entry.progressInterval = undefined;
  }

  entry.worker.postMessage({ taskId, type: 'cancel' });

  bus.emit('data.snapshot.load.cancel', {
    fileName: entry.task.fileName,
    taskId,
  });

  entry.reject(new Error('Task canceled'));
  return true;
}

export function terminateAllParserWorkers(): void {
  if (!workerSupported) return;

  for (const [taskId, entry] of inFlight.entries()) {
    if (entry.progressInterval) {
      clearInterval(entry.progressInterval);
    }
    entry.canceled = true;
    entry.reject(new Error('Worker terminated'));
  }

  workers.forEach((w) => w.terminate());
  workers.length = 0;

  inFlight.clear();
  canceledTasks.clear();
}

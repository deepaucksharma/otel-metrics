import { jsonSafeParse } from '@/logic/workers/utils/jsonSafeParse';
import { mapToParsedSnapshot } from '@/logic/workers/mapping/otlpMapper';
import type { RawOtlpExportMetricsServiceRequest } from '@intellimetric/contracts/rawOtlpTypes';
import { bus } from '@/services/eventBus';
import { randomId } from '@/utils/randomId';
import {
  ensurePool,
  emitProgress,
  nextWorker,
  workerSupported,
  inFlight,
} from './workerPool';
import {
  isTaskCanceled,
  cancelParserTask,
  terminateAllParserWorkers,
} from './parserCancellation';
import type { ParseTask, WorkerSuccess, WorkerFailure } from './parserTypes';

async function parseSynchronously(
  taskId: string,
  task: ParseTask,
): Promise<WorkerSuccess | WorkerFailure> {
  emitProgress(taskId, task.fileName, 0, 'parsing');

  if (isTaskCanceled(taskId)) {
    throw new Error('Task canceled');
  }

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

  if (isTaskCanceled(taskId)) {
    throw new Error('Task canceled');
  }

  emitProgress(taskId, task.fileName, 50, 'mapping');

  try {
    const snapshot = mapToParsedSnapshot(
      parsed.value,
      task.snapshotId,
      task.fileName,
    );

    emitProgress(taskId, task.fileName, 90, 'processing');

    if (isTaskCanceled(taskId)) {
      throw new Error('Task canceled');
    }

    emitProgress(taskId, task.fileName, 100, 'processing');

    return { type: 'parsedSnapshot', payload: snapshot, taskId };
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

export function dispatchToParserWorker(
  task: ParseTask,
): Promise<WorkerSuccess | WorkerFailure> {
  const taskId = randomId();
  bus.emit('data.snapshot.load.start', {
    fileName: task.fileName,
    fileSize: task.fileSize,
  });

  if (!workerSupported) {
    return parseSynchronously(taskId, task);
  }

  ensurePool();

  return new Promise((resolve, reject) => {
    const worker = nextWorker();
    const entry = {
      resolve,
      reject,
      worker,
      task,
      canceled: false,
    } as any;

    if (task.fileSize > 5 * 1024 * 1024) {
      entry.progressInterval = setInterval(() => {
        worker.postMessage({ taskId, type: 'pingProgress' });
      }, 500) as unknown as number;
    }

    inFlight.set(taskId, entry);
    worker.postMessage({ taskId, type: 'parse', payload: task });
  });
}

export { cancelParserTask, terminateAllParserWorkers };

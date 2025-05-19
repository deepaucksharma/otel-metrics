/**
 * Data structures exchanged between the main thread and parser workers.
 *
 * These types are imported by worker pool and cancellation helpers as well as
 * consumers like StaticFileProvider.
 */
import type { ParsedSnapshot } from '@intellimetric/contracts/types';

/** Task parameters for a single snapshot parse job. */
export interface ParseTask {
  snapshotId: string;
  fileName: string;
  rawJson: string;
  fileSize: number;
}

/** Error payload delivered when the worker fails. */
export interface ParserErrorPayload {
  snapshotId: string;
  fileName: string;
  taskId: string;
  message: string;
  detail?: string;
}

/** Progress update details emitted periodically. */
export interface ProgressPayload {
  taskId: string;
  fileName: string;
  progress: number;
  stage: 'parsing' | 'mapping' | 'processing';
}

/** Successful worker completion payload. */
export type WorkerSuccess = {
  type: 'parsedSnapshot';
  payload: ParsedSnapshot;
  taskId: string;
};

/** Failure payload from the worker thread. */
export type WorkerFailure = {
  type: 'parserError';
  payload: ParserErrorPayload;
};

/** Progress event wrapper posted by the worker. */
export type WorkerProgress = {
  type: 'parserProgress';
  payload: ProgressPayload;
};

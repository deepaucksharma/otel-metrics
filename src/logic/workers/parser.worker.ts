/**
 * Web Worker entry orchestrating `jsonSafeParse` and `otlpMapper`.
 *
 * @remarks
 * This worker receives messages from {@link dispatchToParserWorker} using the
 * following shape:
 *
 * ```ts
 * interface WorkerInbound {
 *   taskId: string;
 *   type: 'parse';
 *   payload: {
 *     rawJson: string;
 *     snapshotId: string;
 *     fileName: string;
 *   };
 * }
 * ```
 *
 * If the message `type` is not `parse` it is ignored.
 *
 * The worker replies with one of two message types:
 *
 * - `parsedSnapshot` – `{ taskId, type:'parsedSnapshot', payload: ParsedSnapshot }`
 * - `parserError` – `{ taskId, type:'parserError', payload: ParserErrorPayload }`
 *
 * A `ParserErrorPayload` has the form:
 *
 * ```ts
 * interface ParserErrorPayload {
 *   snapshotId: string;
 *   fileName: string;
 *   message: string;
 *   detail?: string;
 * }
 * ```
 *
 * All errors from JSON parsing or OTLP mapping are caught and returned as
 * `parserError` messages. Uncaught runtime errors trigger `console.error` via
 * `self.onerror` but keep the worker alive.
 *
 * ## Dependencies
 * - {@link jsonSafeParse} – safe JSON parser that returns an Either
 * - {@link mapToParsedSnapshot} – converts raw OTLP structures to internal
 *   {@link ParsedSnapshot}
 * - {@link RawOtlpExportMetricsServiceRequest} – raw OTLP JSON interfaces
 */
import { jsonSafeParse } from './utils/jsonSafeParse';
import { mapToParsedSnapshot } from './mapping/otlpMapper';
import type { RawOtlpExportMetricsServiceRequest } from '@intellimetric/contracts/rawOtlpTypes';
import type { ParsedSnapshot } from '@intellimetric/contracts/types';

/** Inbound message handled by this worker. */
interface WorkerInbound {
  taskId: string;
  type: 'parse';
  payload: {
    rawJson: string;
    snapshotId: string;
    fileName: string;
  };
}

/** Payload returned when processing fails. */
interface ParserErrorPayload {
  snapshotId: string;
  fileName: string;
  message: string;
  detail?: string;
}

/** Successful response from the worker. */
interface ParsedSnapshotMessage {
  taskId: string;
  type: 'parsedSnapshot';
  payload: ParsedSnapshot;
}

/** Error response from the worker. */
interface ParserErrorMessage {
  taskId: string;
  type: 'parserError';
  payload: ParserErrorPayload;
}

self.onmessage = (e: MessageEvent<WorkerInbound>): void => {
  if (!e.data || e.data.type !== 'parse') return;

  const { taskId, payload } = e.data;
  const { rawJson, snapshotId, fileName } = payload;

  const parsed = jsonSafeParse<RawOtlpExportMetricsServiceRequest>(rawJson);
  if (parsed.type === 'left') {
    postError('JSON parsing failed', parsed.value);
    return;
  }

  try {
    const snapshot = mapToParsedSnapshot(
      parsed.value,
      snapshotId,
      fileName
    );
    const msg: ParsedSnapshotMessage = {
      taskId,
      type: 'parsedSnapshot',
      payload: snapshot,
    };
    self.postMessage(msg);
  } catch (err: any) {
    postError('OTLP mapping failed', err instanceof Error ? err : new Error(String(err)));
  }

  function postError(msg: string, err: Error): void {
    const errorMsg: ParserErrorMessage = {
      taskId,
      type: 'parserError',
      payload: {
        snapshotId,
        fileName,
        message: `${msg}: ${err.message}`,
        detail: err.stack,
      },
    };
    self.postMessage(errorMsg);
  }
};

self.onerror = (e): void => {
  // eslint-disable-next-line no-console
  console.error('Worker runtime error', e);
};

export {};

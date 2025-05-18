// Browser-side file loader UI that funnels snapshot files into validation → read → worker pipeline.

import React, { useCallback, useRef, useState } from 'react';
import { bus } from '../services/eventBus';
import { validateFile, ValidFile } from './fileValidator';
import { readFileContent } from './readFile';
import { dispatchToParserWorker } from './dispatchToWorker';
import { randomId } from '@/utils/randomId';

/**
 * Props for {@link StaticFileProvider}.
 *
 * @property acceptGzip If false, gzipped files are rejected. Defaults to `true`.
 * @property maxSizeBytes Override maximum allowed file size (default `100 MiB`).
 * @property className Optional CSS class for the drop area container.
 */
export interface StaticFileProviderProps {
  acceptGzip?: boolean;
  maxSizeBytes?: number;
  className?: string;
}

/**
 * Browser component that accepts local snapshot files and pushes them through
 * validation, reading and worker parsing steps. Status updates and errors are
 * broadcast via the global {@link bus}.
 *
 * ### Internal flow
 * 1. Hidden `<input type="file" multiple>` stores the FileList.
 * 2. Drop area or keyboard activation triggers the input.
 * 3. For each chosen file:
 *    - Generate an id and emit `data.snapshot.load.start`.
 *    - Validate using {@link validateFile}. Invalid files emit `data.snapshot.error`.
 *    - Read text with {@link readFileContent}.
 *    - Dispatch to parser worker via {@link dispatchToParserWorker}.
 *    - Emit `data.snapshot.parsed` on success; otherwise emit `data.snapshot.error`.
 *
 * ### Dependencies
 * - {@link validateFile}
 * - {@link readFileContent}
 * - {@link dispatchToParserWorker}
 * - {@link bus}
 * - React hooks
 */
export function StaticFileProvider({
  acceptGzip = true,
  maxSizeBytes = 100 * 1024 * 1024,
  className,
}: StaticFileProviderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [status, setStatus] = useState<Record<string, string>>({});

  const handleFiles = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        const id = randomId();
        const snapshotId = `snap-${id}`;
        setStatus((s) => ({ ...s, [id]: `\u{1F680} reading … ${file.name}` }));
        bus.emit('data.snapshot.load.start', { fileName: file.name });

        const result = validateFile(file, maxSizeBytes);
        if (result.type === 'left') {
          bus.emit('data.snapshot.error', {
            fileName: file.name,
            error: result.value.message,
          });
          setStatus((s) => ({ ...s, [id]: `\u274C ${result.value.message}` }));
          continue;
        }
        const valid: ValidFile = result.value;
        if (valid.isGzipped && !acceptGzip) {
          const msg = 'Gzip files are not accepted';
          bus.emit('data.snapshot.error', { fileName: file.name, error: msg });
          setStatus((s) => ({ ...s, [id]: `\u274C ${msg}` }));
          continue;
        }
        try {
          const text = await readFileContent(valid);
          const workerRes = await dispatchToParserWorker({
            snapshotId,
            fileName: file.name,
            rawJson: text,
          });
          if (workerRes.type === 'parsedSnapshot') {
            bus.emit('data.snapshot.parsed', { snapshot: workerRes.payload });
            setStatus((s) => ({
              ...s,
              [id]: `\u2705 loaded ${workerRes.payload.id}`,
            }));
          } else {
            bus.emit('data.snapshot.error', {
              fileName: workerRes.payload.fileName,
              error: workerRes.payload.message,
            });
            setStatus((s) => ({
              ...s,
              [id]: `\u274C ${workerRes.payload.message}`,
            }));
          }
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          bus.emit('data.snapshot.error', { fileName: file.name, error: message });
          setStatus((s) => ({ ...s, [id]: `\u274C ${message}` }));
        }
      }
    },
    [acceptGzip, maxSizeBytes]
  );

  const openFileDialog = () => inputRef.current?.click();

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const onDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files) handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openFileDialog();
    }
  };

  return (
    <div className={className}>
      <label
        className={`dropArea${dragActive ? ' dragActive' : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onClick={openFileDialog}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
      >
        <input
          type="file"
          multiple
          hidden
          ref={inputRef}
          onChange={onInputChange}
        />
        <span>Drop snapshot files or click to browse</span>
      </label>
      <ul className="statusList" aria-live="polite">
        {Object.entries(status).map(([id, msg]) => (
          <li key={id}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default StaticFileProvider;

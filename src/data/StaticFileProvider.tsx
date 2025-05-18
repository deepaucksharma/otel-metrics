/**
 * Browser-side file loader UI that funnels snapshot files into validation → read → worker pipeline.
 *
 * @purpose Provide a UI for loading OTLP snapshot files with drag-and-drop or file browser.
 * @algorithm
 * 1. Allow users to select files via drag-and-drop or file dialog
 * 2. Validate each file for size and format
 * 3. Process valid files through worker pipeline
 * 4. Track and display processing status with progress indicators
 */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import { bus } from '../services/eventBus';
import { validateFile, ValidFile } from './fileValidator';
import { readFileContent } from './readFile';
import { dispatchToParserWorker, cancelParserTask } from './dispatchToWorker';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useUiSlice } from '@/state/uiSlice';
import styles from './StaticFileProvider.module.css';

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
  const [activeTasks, setActiveTasks] = useState<Record<string, string>>({});
  const handleError = useErrorHandler();
  const openProgressPanel = useUiSlice(state => state.openProgressPanel);

  const handleFiles = useCallback(
    async (files: FileList) => {
      for (const file of Array.from(files)) {
        const id = crypto.randomUUID();
        const snapshotId = `snap-${id}`;
        const fileSize = file.size;
        
        // Update local status and keep track of active task
        setStatus((s) => ({ ...s, [id]: `\u{1F680} reading … ${file.name}` }));
        setActiveTasks((tasks) => ({ ...tasks, [id]: snapshotId }));
        
        // Open progress panel for large files automatically
        if (fileSize > 5 * 1024 * 1024) { // 5MB
          openProgressPanel();
        }
        
        // Emit start event with file size information
        bus.emit('data.snapshot.load.start', { 
          fileName: file.name, 
          fileSize: file.size,
          taskId: id
        });

        const result = validateFile(file, maxSizeBytes);
        if (result.type === 'left') {
          // Enhanced error details
          const errorPayload = {
            fileName: file.name,
            error: result.value.message,
            taskId: id,
            detail: result.value.stack
          };
          bus.emit('data.snapshot.error', errorPayload);
          setStatus((s) => ({ ...s, [id]: `\u274C ${result.value.message}` }));
          setActiveTasks((tasks) => {
            const newTasks = { ...tasks };
            delete newTasks[id];
            return newTasks;
          });
          continue;
        }
        const valid: ValidFile = result.value;
        if (valid.isGzipped && !acceptGzip) {
          const msg = 'Gzip files are not accepted';
          bus.emit('data.snapshot.error', { 
            fileName: file.name, 
            error: msg,
            taskId: id 
          });
          setStatus((s) => ({ ...s, [id]: `\u274C ${msg}` }));
          setActiveTasks((tasks) => {
            const newTasks = { ...tasks };
            delete newTasks[id];
            return newTasks;
          });
          continue;
        }
        try {
          const text = await readFileContent(valid);
          const workerRes = await dispatchToParserWorker({
            snapshotId,
            fileName: file.name,
            rawJson: text,
            fileSize: file.size
          });
          
          // Remove from active tasks list
          setActiveTasks((tasks) => {
            const newTasks = { ...tasks };
            delete newTasks[id];
            return newTasks;
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
              taskId: id,
              detail: workerRes.payload.detail
            });
            setStatus((s) => ({
              ...s,
              [id]: `\u274C ${workerRes.payload.message}`,
            }));
          }
        } catch (err) {
          // Remove from active tasks list
          setActiveTasks((tasks) => {
            const newTasks = { ...tasks };
            delete newTasks[id];
            return newTasks;
          });
          
          // Enhanced error handling
          const error = err instanceof Error ? err : new Error(String(err));
          const message = error.message;
          const detail = error.stack;
          
          bus.emit('data.snapshot.error', { 
            fileName: file.name, 
            error: message,
            taskId: id,
            detail
          });
          
          setStatus((s) => ({ ...s, [id]: `\u274C ${message}` }));
          
          // Propagate error to ErrorBoundary if it's not a cancellation
          if (!message.includes('Task canceled')) {
            handleError(error);
          }
        }
      }
    },
    [acceptGzip, maxSizeBytes, openProgressPanel, handleError]
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

  // Cancel any active tasks on component unmount
  useEffect(() => {
    return () => {
      // Cleanup any active tasks on unmount
      Object.entries(activeTasks).forEach(([id]) => {
        cancelParserTask(id);
      });
    };
  }, [activeTasks]);
  
  return (
    <div className={className}>
      <label
        className={`${styles.dropArea}${dragActive ? ' ' + styles.dragActive : ''}`}
        role="button"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onClick={openFileDialog}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        aria-label="Drop snapshot files or click to browse"
      >
        <input
          type="file"
          multiple
          hidden
          ref={inputRef}
          onChange={onInputChange}
          accept=".json,.gz"
          aria-label="File input"
        />
        <span>Drop snapshot files or click to browse</span>
        <p className={styles.dropAreaSubtext}>Accepts OTLP JSON and gzipped JSON formats</p>
      </label>
      <ul className={styles.statusList} aria-live="polite">
        {Object.entries(status).map(([id, msg]) => (
          <li key={id}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}

export default StaticFileProvider;

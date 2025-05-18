/**
 * Store all loaded snapshots and expose CRUD actions plus memoised selectors.
 *
 * This slice holds parsed OTLP snapshots keyed by `snapshot.id` and keeps an
 * array of insertion order. It exposes actions to add, remove and clear
 * snapshots, and provides helper selectors used throughout the application.
 *
 * Consumers:
 * - `useSnapshot` hook for retrieving a single snapshot
 * - `useInspectorProps` for building inspector data
 * - `registerEventListeners` service for reacting to worker events
 *
 * Tests cover CRUD operations and selector behaviour.
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { ParsedSnapshot } from '@intellimetric/contracts/types';

/** Progress information for a loading file */
export interface LoadingProgress {
  /** File name being processed */
  fileName: string;
  /** Task ID for tracking/cancellation */
  taskId: string;
  /** Progress percentage (0-100) */
  progress: number;
  /** Current processing stage */
  stage: 'parsing' | 'mapping' | 'processing';
  /** File size in bytes */
  fileSize: number;
  /** Timestamp when loading started */
  startTime: number;
}

/** State for {@link useMetricsSlice}. */
export interface MetricsSliceState {
  /** All snapshots keyed by `snapshot.id`. */
  snapshots: Record<string, ParsedSnapshot>;
  /** Ordered list of snapshot ids in insertion order. */
  snapshotOrder: string[];
  /** Files currently being loaded keyed by file name. */
  loading: Record<string, boolean>;
  /** Detailed progress for files being loaded */
  progress: Record<string, LoadingProgress>;
  /** Errors encountered while loading keyed by file name. */
  errors: Record<string, { message: string; detail?: string }>;
  /** Map of task IDs to file names for quick lookup */
  taskMap: Record<string, string>;
}

/** Actions mutating {@link MetricsSliceState}. */
export interface MetricsSliceActions {
  /** Add or replace a snapshot. */
  addSnapshot(snap: ParsedSnapshot): void;
  /** Remove a snapshot by id. */
  removeSnapshot(id: string): void;
  /** Clear all snapshots. */
  clearSnapshots(): void;
  /** Record an error for a given file. */
  registerError(fileName: string, error: string, detail?: string): void;
  /** Mark a file as currently loading. */
  markLoading(fileName: string, fileSize: number, taskId: string): void;
  /** Update progress for a loading file. */
  updateProgress(taskId: string, progress: number, stage: LoadingProgress['stage']): void;
  /** Cancel a running task. */
  cancelTask(taskId: string): void;
}

/** Zustand store containing metrics data and actions. */
export const useMetricsSlice = create<MetricsSliceState & MetricsSliceActions>()(
  immer((set) => ({
    snapshots: {},
    snapshotOrder: [],
    loading: {},
    progress: {},
    errors: {},
    taskMap: {},

    addSnapshot: (snap) =>
      set((state) => {
        state.snapshots[snap.id] = snap;
        if (!state.snapshotOrder.includes(snap.id)) {
          state.snapshotOrder.push(snap.id);
        }
        
        // Clean up loading state and progress
        const fileName = snap.fileName;
        delete state.loading[fileName];
        delete state.errors[fileName];
        
        // Find and remove any task IDs associated with this file
        const taskIds = Object.entries(state.taskMap)
          .filter(([_, fn]) => fn === fileName)
          .map(([taskId]) => taskId);
          
        for (const taskId of taskIds) {
          delete state.taskMap[taskId];
        }
        
        delete state.progress[fileName];
      }),

    removeSnapshot: (id) =>
      set((state) => {
        const snap = state.snapshots[id];
        if (snap) {
          const fileName = snap.fileName;
          delete state.loading[fileName];
          delete state.errors[fileName];
          delete state.progress[fileName];
          
          // Clean up any associated tasks
          const taskIds = Object.entries(state.taskMap)
            .filter(([_, fn]) => fn === fileName)
            .map(([taskId]) => taskId);
            
          for (const taskId of taskIds) {
            delete state.taskMap[taskId];
          }
        }
        
        delete state.snapshots[id];
        state.snapshotOrder = state.snapshotOrder.filter((i) => i !== id);
      }),

    clearSnapshots: () =>
      set((state) => {
        state.snapshots = {};
        state.snapshotOrder = [];
        state.loading = {};
        state.progress = {};
        state.errors = {};
        state.taskMap = {};
      }),

    registerError: (fileName, error, detail) =>
      set((state) => {
        state.errors[fileName] = { message: error, detail };
        delete state.loading[fileName];
        delete state.progress[fileName];
        
        // Clean up any associated tasks
        const taskIds = Object.entries(state.taskMap)
          .filter(([_, fn]) => fn === fileName)
          .map(([taskId]) => taskId);
          
        for (const taskId of taskIds) {
          delete state.taskMap[taskId];
        }
      }),

    markLoading: (fileName, fileSize, taskId) =>
      set((state) => {
        state.loading[fileName] = true;
        state.taskMap[taskId] = fileName;
        state.progress[fileName] = {
          fileName,
          taskId,
          progress: 0,
          stage: 'parsing',
          fileSize,
          startTime: Date.now()
        };
        delete state.errors[fileName];
      }),
      
    updateProgress: (taskId, progress, stage) => 
      set((state) => {
        const fileName = state.taskMap[taskId];
        if (fileName && state.progress[fileName]) {
          state.progress[fileName].progress = progress;
          state.progress[fileName].stage = stage;
        }
      }),
      
    cancelTask: (taskId) =>
      set((state) => {
        const fileName = state.taskMap[taskId];
        if (fileName) {
          delete state.loading[fileName];
          delete state.progress[fileName];
          delete state.taskMap[taskId];
        }
      }),
  }))
);

/**
 * Cache for expensive series count calculations.
 * WeakMap avoids holding onto stale snapshots after removal.
 */
const seriesCountCache = new WeakMap<ParsedSnapshot, number>();

function computeSeriesCount(snapshot: ParsedSnapshot): number {
  const cached = seriesCountCache.get(snapshot);
  if (cached != null) return cached;

  let count = 0;
  for (const res of snapshot.resources) {
    for (const scope of res.scopes) {
      for (const metric of scope.metrics) {
        count += metric.seriesData.size;
      }
    }
  }
  seriesCountCache.set(snapshot, count);
  return count;
}

/** Selector for a snapshot by id. */
export const selectSnapshotById = (id: string) => (state: MetricsSliceState) =>
  state.snapshots[id];

/** Selector for all snapshots in insertion order. */
export const selectAllSnapshots = (state: MetricsSliceState) =>
  state.snapshotOrder.map((id) => state.snapshots[id]);

/**
 * Selector returning lightweight snapshot summaries.
 * Each summary contains `id`, `fileName` and cached `seriesCount`.
 */
export const selectSnapshotSummaries = (state: MetricsSliceState) =>
  state.snapshotOrder.map((id) => {
    const snap = state.snapshots[id];
    return {
      id: snap.id,
      fileName: snap.fileName,
      seriesCount: computeSeriesCount(snap),
    };
  });

/** Selector for current loading state keyed by file name. */
export const selectLoading = (state: MetricsSliceState) => state.loading;

/** Selector for recorded errors keyed by file name. */
export const selectErrors = (state: MetricsSliceState) => state.errors;

/** Selector for progress information keyed by file name. */
export const selectProgress = (state: MetricsSliceState) => state.progress;

/** Selector for a specific file's progress. */
export const selectFileProgress = (fileName: string) => 
  (state: MetricsSliceState) => state.progress[fileName];

/** Selector for task cancellation status. */
export const selectTaskInfo = (taskId: string) => 
  (state: MetricsSliceState) => {
    const fileName = state.taskMap[taskId];
    return fileName ? state.progress[fileName] : undefined;
  };
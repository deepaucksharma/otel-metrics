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

/** State for {@link useMetricsSlice}. */
export interface MetricsSliceState {
  /** All snapshots keyed by `snapshot.id`. */
  snapshots: Record<string, ParsedSnapshot>;
  /** Ordered list of snapshot ids in insertion order. */
  snapshotOrder: string[];
  /** Files currently being loaded keyed by file name. */
  loading: Record<string, boolean>;
  /** Errors encountered while loading keyed by file name. */
  errors: Record<string, string>;
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
  registerError(fileName: string, error: string): void;
  /** Mark a file as currently loading. */
  markLoading(fileName: string): void;
}

/** Zustand store containing metrics data and actions. */
export const useMetricsSlice = create<MetricsSliceState & MetricsSliceActions>()(
  immer((set) => ({
    snapshots: {},
    snapshotOrder: [],
    loading: {},
    errors: {},

    addSnapshot: (snap) =>
      set((state) => {
        state.snapshots[snap.id] = snap;
        if (!state.snapshotOrder.includes(snap.id)) {
          state.snapshotOrder.push(snap.id);
        }
        delete state.loading[snap.fileName];
        delete state.errors[snap.fileName];
      }),

    removeSnapshot: (id) =>
      set((state) => {
        const snap = state.snapshots[id];
        if (snap) {
          delete state.loading[snap.fileName];
          delete state.errors[snap.fileName];
        }
        delete state.snapshots[id];
        state.snapshotOrder = state.snapshotOrder.filter((i) => i !== id);
      }),

    clearSnapshots: () =>
      set((state) => {
        state.snapshots = {};
        state.snapshotOrder = [];
        state.loading = {};
        state.errors = {};
      }),

    registerError: (fileName, error) =>
      set((state) => {
        state.errors[fileName] = error;
        delete state.loading[fileName];
      }),

    markLoading: (fileName) =>
      set((state) => {
        state.loading[fileName] = true;
        delete state.errors[fileName];
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

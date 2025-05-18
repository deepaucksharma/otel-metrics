/**
 * Global state slice tracking what the user is looking at (active snapshot, drawer state, etc.).
 *
 * @remarks
 * - Stores IDs for active/baseline/comparison snapshots
 * - Tracks metric, series and point currently inspected
 * - Controls inspector drawer visibility and dashboard filter
 *
 * @dependencies Zustand with immer middleware
 * @packageDocumentation
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { SeriesKey } from '@intellimetric/contracts/types';

/** Shape of UI slice state. */
export interface UiSliceState {
  activeSnapshotId: string | null;
  snapshotAId: string | null;
  snapshotBId: string | null;

  inspectedMetricName: string | null;
  inspectedSeriesKey: SeriesKey | null;
  inspectedPointId: number | null;

  isInspectorOpen: boolean;
  dashboardFilter: string;
}

/** Actions to mutate UI slice state. */
export interface UiSliceActions {
  setActiveSnapshot(id: string | null): void;
  setSnapshotRoleA(id: string | null): void;
  setSnapshotRoleB(id: string | null): void;

  inspectMetric(metricName: string): void;
  inspectSeriesAndPoint(seriesKey: SeriesKey, pointId: number): void;

  openInspector(): void;
  closeInspector(): void;

  setDashboardFilter(text: string): void;

  resetUi(): void;
}

/** Zustand store instance for UI state. */
export const useUiSlice = create<UiSliceState & UiSliceActions>()(
  immer(set => ({
    activeSnapshotId: null,
    snapshotAId: null,
    snapshotBId: null,

    inspectedMetricName: null,
    inspectedSeriesKey: null,
    inspectedPointId: null,

    isInspectorOpen: false,
    dashboardFilter: '',

    setActiveSnapshot: id => set(s => { s.activeSnapshotId = id; }),
    setSnapshotRoleA: id => set(s => { s.snapshotAId = id; }),
    setSnapshotRoleB: id => set(s => { s.snapshotBId = id; }),

    inspectMetric: metricName => set(s => { s.inspectedMetricName = metricName; }),
    inspectSeriesAndPoint: (seriesKey, pointId) => set(s => {
      s.inspectedSeriesKey = seriesKey;
      s.inspectedPointId = pointId;
    }),

    openInspector: () => set(s => { s.isInspectorOpen = true; }),
    closeInspector: () => set(s => { s.isInspectorOpen = false; }),

    setDashboardFilter: text => set(s => { s.dashboardFilter = text; }),

    resetUi: () => set(s => {
      s.activeSnapshotId = null;
      s.snapshotAId = null;
      s.snapshotBId = null;
      s.inspectedMetricName = null;
      s.inspectedSeriesKey = null;
      s.inspectedPointId = null;
      s.isInspectorOpen = false;
      s.dashboardFilter = '';
    })
  }))
);

/** Selector for inspector drawer visibility. */
export const selectIsInspectorOpen = (state: UiSliceState) => state.isInspectorOpen;

/**
 * Selector for current inspection context.
 * Returns snapshot ID, metric name, series key and point ID of what is being inspected.
 */
export const selectCurrentInspectionContext = (state: UiSliceState) => ({
  snapshotId: state.activeSnapshotId,
  metricName: state.inspectedMetricName,
  seriesKey: state.inspectedSeriesKey,
  pointId: state.inspectedPointId
});

export default useUiSlice;

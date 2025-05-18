/**
 * Combine three sources into a memoised `InspectorProps` object for the DataPointInspectorDrawer.
 *
 * UI state from {@link useUiSlice}, parsed snapshot data from {@link useSnapshot},
 * and cardinality context from {@link getProcessedMetricInfo} are merged into a
 * single object. The hook reads the currently inspected snapshot and metric
 * from the global UI slice rather than requiring them as parameters. The hook
 * returns `null` until every piece of the context is available.
 *
 * @param simulateDropKey - optional attribute key to simulate dropping for
 * cardinality reduction demonstration.
 * @returns fully assembled {@link InspectorProps} or `null` when information is
 * missing.
 *
 * @remarks
 * **Consumers:** `MetricInstanceWidget` passes these props to
 * `DataPointInspectorDrawer`.
 *
 * **Tests:** scenarios cover missing context, successful assembly,
 * memoisation stability and drop simulation behaviour.
 */
import { useMemo } from 'react';
import { useUiSlice } from '@/state/uiSlice';
import { useSnapshot } from './useSnapshot';
import { findSeriesData } from '@/utils/findSeriesData';
import { getProcessedMetricInfo } from '@/logic/metricProcessor';
import { DEFAULT_THRESHOLD_HIGH } from '@/config';
import type { InspectorProps } from '@intellimetric/contracts/types';

export function useInspectorProps(simulateDropKey?: string | null): InspectorProps | null {
  const {
    activeSnapshotId,
    inspectedMetricName,
    inspectedSeriesKey,
    inspectedPointId,
    isInspectorOpen,
    closeInspector,
    setDashboardFilter,
  } = useUiSlice(state => ({
    activeSnapshotId : state.activeSnapshotId,
    inspectedMetricName: state.inspectedMetricName,
    inspectedSeriesKey : state.inspectedSeriesKey,
    inspectedPointId   : state.inspectedPointId,
    isInspectorOpen    : state.isInspectorOpen,
    closeInspector     : state.closeInspector,
    setDashboardFilter : state.setDashboardFilter,
  }));

  const snapshot = useSnapshot(activeSnapshotId);

  return useMemo(() => {
    if (!isInspectorOpen) return null;
    if (!snapshot || !inspectedMetricName || !inspectedSeriesKey || !inspectedPointId) {
      return null;
    }

    const metricInfo = getProcessedMetricInfo(snapshot, inspectedMetricName, {
      simulateDropAttributeKey: simulateDropKey || undefined,
    });
    if (!metricInfo) return null;

    const series = findSeriesData(snapshot, inspectedMetricName, inspectedSeriesKey);
    if (!series) return null;

    const point = series.points.find(p => p.timestampUnixNano === inspectedPointId);
    if (!point) return null;

    const attrOfPoint = [
      ...Object.keys(series.metricAttributes),
      ...Object.keys(series.resourceAttributes),
    ];

    const props: InspectorProps = {
      metricName : metricInfo.definition.name,
      seriesKey  : inspectedSeriesKey,
      point,
      resourceAttrs: series.resourceAttributes,
      metricAttrs  : series.metricAttributes,
      metricDefinition: metricInfo.definition,
      cardinality : {
        ...metricInfo.cardinality,
        attrOfPoint,
        thresholdHigh: DEFAULT_THRESHOLD_HIGH,
      },
      exemplars: point.exemplars,
      onClose: closeInspector,
      onAddGlobalFilter: (key, value) =>
        setDashboardFilter(`${key}=${String(value)}`),
      metricLatestNValues: undefined,
    };

    return props;
  }, [
    isInspectorOpen,
    snapshot,
    inspectedMetricName,
    inspectedSeriesKey,
    inspectedPointId,
    simulateDropKey,
    closeInspector,
    setDashboardFilter,
  ]);
}

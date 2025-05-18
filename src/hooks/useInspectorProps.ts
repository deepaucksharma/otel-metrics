/**
 * Combine three sources into a memoised `InspectorProps` object for the DataPointInspectorDrawer.
 *
 * @purpose Create a stable, complete InspectorProps object from multiple data sources.
 * @algorithm
 * 1. Extract required UI context from global slice (snapshot, metric, series, point ids)
 * 2. Load snapshot data using the useSnapshot hook
 * 3. Find specific metric, series, and point data 
 * 4. Validate each step's output for null/empty values
 * 5. Construct a complete props object with defaults where needed
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
import { useMemo, useCallback } from 'react';
import { useUiSlice } from '@/state/uiSlice';
import { useSnapshot } from './useSnapshot';
import { findSeriesData } from '@/utils/findSeriesData';
import { getProcessedMetricInfo } from '@/logic/metricProcessor';
import { DEFAULT_THRESHOLD_HIGH } from '@/config';
import type { InspectorProps } from '@/contracts/types';

export function useInspectorProps(simulateDropKey?: string | null): InspectorProps | null {
  // Extract UI state - memoized selectors would be even better, but this is already an improvement
  const uiState = useUiSlice(state => ({
    activeSnapshotId : state.activeSnapshotId,
    inspectedMetricName: state.inspectedMetricName,
    inspectedSeriesKey : state.inspectedSeriesKey,
    inspectedPointId   : state.inspectedPointId,
    isInspectorOpen    : state.isInspectorOpen,
  }));
  
  // Memoize actions separately since they rarely change
  const uiActions = useUiSlice(state => ({
    closeInspector     : state.closeInspector,
    setDashboardFilter : state.setDashboardFilter,
  }));

  // Destructure for cleaner code
  const {
    activeSnapshotId,
    inspectedMetricName,
    inspectedSeriesKey,
    inspectedPointId,
    isInspectorOpen,
  } = uiState;
  
  const {
    closeInspector,
    setDashboardFilter
  } = uiActions;

  // Get snapshot data
  const snapshot = useSnapshot(activeSnapshotId);
  
  // Memoize the filter callback to prevent needless re-renders
  const handleAddFilter = useCallback((key: string, value: string | number | boolean) => {
    setDashboardFilter(`${key}=${String(value)}`);
  }, [setDashboardFilter]);
  
  // Memoize the series lookup - this is an expensive operation
  const seriesData = useMemo(() => {
    if (!snapshot || !inspectedMetricName || !inspectedSeriesKey) {
      return null;
    }
    
    return findSeriesData(snapshot, inspectedMetricName, inspectedSeriesKey);
  }, [snapshot, inspectedMetricName, inspectedSeriesKey]);
  
  // Memoize the point lookup
  const pointData = useMemo(() => {
    if (!seriesData || !seriesData.points || !inspectedPointId) {
      return null;
    }
    
    return seriesData.points.find(p => p.timestampUnixNano === inspectedPointId);
  }, [seriesData, inspectedPointId]);
  
  // Memoize the metric info lookup with simulation
  const metricInfo = useMemo(() => {
    if (!snapshot || !inspectedMetricName) {
      return null;
    }
    
    return getProcessedMetricInfo(snapshot, inspectedMetricName, {
      simulateDropAttributeKey: simulateDropKey || undefined,
    });
  }, [snapshot, inspectedMetricName, simulateDropKey]);
  
  // Memoize the attribute keys list
  const attrOfPoint = useMemo(() => {
    if (!seriesData) return [];
    
    return [
      ...Object.keys(seriesData.metricAttributes || {}),
      ...Object.keys(seriesData.resourceAttributes || {}),
    ];
  }, [seriesData]);

  // Final assembly of all parts into the props object
  return useMemo(() => {
    // Quick exit for common cases
    if (!isInspectorOpen) return null;
    
    // Log detailed error information for missing data
    if (!snapshot) {
      console.warn('Inspector requested but snapshot is missing');
      return null;
    }
    
    if (!inspectedMetricName) {
      console.warn('Inspector requested but metric name is missing');
      return null;
    }
    
    if (!inspectedSeriesKey) {
      console.warn('Inspector requested but series key is missing');
      return null;
    }
    
    if (!inspectedPointId) {
      console.warn('Inspector requested but point ID is missing');
      return null;
    }
    
    // Check for missing computed values
    if (!metricInfo) {
      console.warn(`Metric info not found for ${inspectedMetricName} in snapshot ${snapshot.id}`);
      return null;
    }
    
    if (!seriesData) {
      console.warn(`Series ${inspectedSeriesKey} not found for metric ${inspectedMetricName}`);
      return null;
    }
    
    if (!pointData) {
      console.warn(`Point with ID ${inspectedPointId} not found in series ${inspectedSeriesKey}`);
      return null;
    }

    // All data is available, assemble final props
    return {
      metricName: metricInfo.definition.name,
      seriesKey: inspectedSeriesKey,
      point: pointData,
      resourceAttrs: seriesData.resourceAttributes || {}, // Provide empty object fallback
      metricAttrs: seriesData.metricAttributes || {},   // Provide empty object fallback
      metricDefinition: metricInfo.definition,
      cardinality: {
        ...metricInfo.cardinality,
        attrOfPoint,
        thresholdHigh: DEFAULT_THRESHOLD_HIGH,
      },
      exemplars: pointData.exemplars || [], // Ensure exemplars is never undefined
      onClose: closeInspector,
      onAddGlobalFilter: handleAddFilter,
      metricLatestNValues: undefined,
    };
  }, [
    isInspectorOpen,
    snapshot,
    inspectedMetricName,
    inspectedSeriesKey,
    inspectedPointId,
    metricInfo,
    seriesData,
    pointData,
    attrOfPoint,
    closeInspector,
    handleAddFilter,
  ]);
}

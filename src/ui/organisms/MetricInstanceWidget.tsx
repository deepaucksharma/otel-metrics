import React, { useCallback } from 'react';
import { useDropSimulation } from '@/hooks/useDropSimulation';
import { useInspectorProps } from '@/hooks/useInspectorProps';
import { DataPointInspectorDrawer } from '@/ui/organisms/DataPointInspectorDrawer';

/**
 * Self-contained widget for rendering a metric and managing the
 * {@link DataPointInspectorDrawer}.
 *
 * The widget obtains inspector properties using {@link useInspectorProps}
 * which reads the current inspection context from global UI state. It keeps track of
 * attribute drop simulation via {@link useDropSimulation} and forwards toggle
 * events from the drawer back to the hook.
 *
 * The drawer is only rendered when the hook returns a complete set of props,
 * allowing parent components to omit the inspector until context is ready.
 */
export interface MetricInstanceWidgetProps {
  /** Identifier of the {@link ParsedSnapshot} to read from. */
  snapshotId: string;
  /** Metric key within the snapshot. */
  metricName: string;
}

/**
 * Render a metric instance along with an optional data point inspector.
 *
 * @remarks
 * Integration with drop simulation is handled through {@link useDropSimulation}.
 * The drawer invokes {@link DataPointInspectorDrawerProps.onSimulateDrop} which
 * is translated to the local toggle function. Every toggle triggers
 * {@link useInspectorProps} to refresh the inspector props so rarity and series
 * counts stay in sync.
 */
export const MetricInstanceWidget: React.FC<MetricInstanceWidgetProps> = ({
  snapshotId,
  metricName,
}) => {
  const [droppedKey, toggleDrop] = useDropSimulation();
  // Inspector props derive snapshot/metric context from uiSlice,
  // only the optional drop simulation key is provided here.
  const inspectorProps = useInspectorProps(droppedKey);

  const handleSimulateDrop = useCallback(
    (key: string, drop: boolean) => {
      toggleDrop(drop ? key : null);
    },
    [toggleDrop]
  );

  return (
    <div className="metric-widget">
      {/* metric summary / chart elements here */}
      {inspectorProps && (
        <DataPointInspectorDrawer
          {...inspectorProps}
          onSimulateDrop={handleSimulateDrop}
        />
      )}
    </div>
  );
};

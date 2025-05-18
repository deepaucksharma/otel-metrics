/**
 * Connect the event bus to global state slices.
 *
 * This module registers handlers on the {@link eventBus} which
 * forward events to actions on the zustand slices returned by
 * {@link useMetricsSlice} and {@link useUiSlice}. It allows the
 * worker and UI layers to communicate without importing the slices
 * directly.
 *
 * ### Tests
 * - listeners are registered for each event type
 * - metrics actions receive the event payloads
 * - UI actions are invoked in the expected order
 * - cleanup detaches all handlers
 */

import { bus as eventBus } from './eventBus';
import { useMetricsSlice } from '@/state/metricsSlice';
import { useUiSlice } from '@/state/uiSlice';
import type { EventTypes } from './eventTypes';

/**
 * Register all event listeners on the global {@link eventBus}.
 *
 * Call once during application startup. Returns a function that
 * unregisters all handlers when invoked.
 */
export function registerEventListeners(): () => void {
  const metricsActions = useMetricsSlice.getState();
  const uiActions = useUiSlice.getState();

  // Data events
  eventBus.on('data.snapshot.loaded', (payload: EventTypes['data.snapshot.loaded']) => {
    metricsActions.addSnapshot(payload.snapshot);
  });

  eventBus.on('data.error', (payload: EventTypes['data.error']) => {
    metricsActions.registerError(payload.message);
  });

  eventBus.on('data.snapshot.loading', (payload: EventTypes['data.snapshot.loading']) => {
    metricsActions.markLoading(payload.fileName);
  });

  // UI events
  eventBus.on('ui.inspector.open', (payload: EventTypes['ui.inspector.open']) => {
    // Update context before opening the inspector
    uiActions.setActiveSnapshot(payload.snapshotId);
    uiActions.inspectMetric(payload.metricName);
    uiActions.inspectSeriesAndPoint(payload.seriesKey, payload.pointId);
    uiActions.openInspector();
  });

  eventBus.on('ui.inspector.close', () => {
    uiActions.closeInspector();
  });

  eventBus.on('ui.metric.inspect', (payload: EventTypes['ui.metric.inspect']) => {
    uiActions.setActiveSnapshot(payload.snapshotId);
    uiActions.inspectMetric(payload.metricName);
  });

  // Cardinality simulation toggle
  eventBus.on(
    'ui.cardinality.simulateDrop',
    (payload: EventTypes['ui.cardinality.simulateDrop']) => {
      uiActions.toggleSimDrop(payload.key, payload.drop);
    }
  );

  // Return cleanup function to detach all listeners
  return () => {
    eventBus.off('*');
  };
}

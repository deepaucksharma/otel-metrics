/**
 * Connect the event bus to global state slices.
 *
 * @purpose Route events from various sources to appropriate state handlers.
 * @algorithm
 * 1. Register handlers on the event bus for each supported event type
 * 2. For each event, route it to the correct action in the appropriate state slice
 * 3. Return a cleanup function that detaches all listeners when invoked
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
import type { EventMap } from './eventBus';

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
  eventBus.on('data.snapshot.loaded', (payload: EventMap['data.snapshot.loaded']) => {
    metricsActions.addSnapshot(payload.snapshot);
  });

  eventBus.on('data.snapshot.error', (payload: EventMap['data.snapshot.error']) => {
    metricsActions.registerError(payload.fileName, payload.error, payload.detail);
  });

  eventBus.on('data.snapshot.load.start', (payload: EventMap['data.snapshot.load.start']) => {
    const taskId = crypto.randomUUID();
    metricsActions.markLoading(payload.fileName, payload.fileSize, taskId);
  });
  
  eventBus.on('data.snapshot.load.progress', (payload: EventMap['data.snapshot.load.progress']) => {
    metricsActions.updateProgress(payload.taskId, payload.progress, payload.stage);
  });
  
  eventBus.on('data.snapshot.load.cancel', (payload: EventMap['data.snapshot.load.cancel']) => {
    metricsActions.cancelTask(payload.taskId);
  });

  // UI events
  eventBus.on('ui.inspector.open', (payload: EventMap['ui.inspector.open']) => {
    // Update context before opening the inspector
    uiActions.setActiveSnapshot(payload.snapshotId);
    uiActions.inspectMetric(payload.metricName);
    uiActions.inspectSeriesAndPoint(payload.seriesKey, payload.pointId);
    uiActions.openInspector();
  });

  eventBus.on('ui.inspector.close', () => {
    uiActions.closeInspector();
  });

  eventBus.on('ui.metric.inspect', (payload: EventMap['ui.metric.inspect']) => {
    uiActions.setActiveSnapshot(payload.snapshotId);
    uiActions.inspectMetric(payload.metricName);
  });

  // Cardinality simulation toggle
  eventBus.on(
    'ui.cardinality.simulateDrop',
    (payload: EventMap['ui.cardinality.simulateDrop']) => {
      uiActions.toggleSimDrop(payload.key, payload.drop);
    }
  );

  // Return cleanup function to detach all listeners
  return () => {
    eventBus.off('data.snapshot.parsed');
    eventBus.off('data.snapshot.error');
    eventBus.off('data.snapshot.load.start');
    eventBus.off('data.snapshot.load.progress');
    eventBus.off('data.snapshot.load.cancel');
    eventBus.off('ui.inspector.open');
    eventBus.off('ui.inspector.close');
    eventBus.off('ui.metric.inspect');
  };
}
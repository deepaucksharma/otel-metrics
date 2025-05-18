import type { ParsedSnapshot, SeriesKey } from '@intellimetric/contracts/types';

/**
 * Event type definitions for the event bus.
 * Maps event names to their payload types.
 */
export interface EventTypes {
  'data.snapshot.loading': { fileId: string; fileName: string };
  'data.snapshot.loaded': { snapshot: ParsedSnapshot };
  'data.error': { message: string; error?: unknown };

  'ui.inspector.open': {
    snapshotId: string;
    metricName: string;
    seriesKey: SeriesKey;
    pointId: number;
  };
  'ui.inspector.close': void;
  'ui.metric.inspect': { snapshotId: string; metricName: string };
  'ui.cardinality.simulateDrop': { key: string; drop: boolean };
}
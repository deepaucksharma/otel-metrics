import type { ParsedSnapshot, SeriesKey } from '@intellimetric/contracts/types';

/**
 * Event type definitions for the event bus.
 * Maps event names to their payload types.
 */
export interface EventTypes {
  'data.snapshot.parsed': { snapshot: ParsedSnapshot };
  'data.snapshot.error': { fileName: string; error: string };
  'data.snapshot.load.start': { fileName: string };
  
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

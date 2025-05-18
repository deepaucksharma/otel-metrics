import mitt from 'mitt';
import type { ParsedSnapshot, SeriesKey } from '@/contracts/types';

/**
 * Maps event names to their payload types.
 */
export interface EventMap {
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
}

/**
 * Global mitt-based event channel for decoupled communication.
 *
 * The bus is a singleton that should be imported wherever cross-layer
 * communication is required. Use `bus.on` to listen for events and
 * `bus.emit` to broadcast new events.
 */
export const bus = mitt<EventMap>();

/**
 * The type of the exported {@link bus} instance.
 */
export type EventBus = typeof bus;


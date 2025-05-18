/**
 * @file src/services/eventBus.ts
 * @summary eventBus module
 * @layer Services
 * @remarks
 * Layer derived from Architecture-Principles.md.
 */
import mitt from 'mitt';
import type { ParsedSnapshot, SeriesKey } from '@/contracts/types';

/**
 * Map of all events that can be emitted on the global {@link bus} instance.
 *
 * Consumers should subscribe to the events relevant to their domain and emit
 * new events as state changes occur. This decouples data providers, workers
 * and UI components by removing direct imports between layers.
 */
export type EventMap = {
  /**
   * A file is being processed.
   *
   * Emitted by the StaticFileProvider when it begins reading a file.
   */
  'data.snapshot.load.start': { fileName: string };

  /**
   * A snapshot has been parsed and is ready for use.
   *
   * Typically emitted by the parser worker once parsing succeeds.
   */
  'data.snapshot.parsed': { snapshot: ParsedSnapshot };

  /**
   * Reports any recoverable error that occurred during loading or parsing.
   */
  'data.snapshot.error': { fileName: string; error: string };

  /**
   * Progress update while loading a snapshot.
   */
  'data.snapshot.progress': { snapshotId: string; progress: number };

  /**
   * A metric widget is requesting to inspect a specific metric.
   */
  'ui.metric.inspect': { metricName: string; snapshotId: string };

  /**
   * Open the data point inspector drawer.
   */
  'ui.inspector.open': {
    snapshotId: string;
    metricName: string;
    seriesKey: SeriesKey;
    pointId: number;
  };

  /**
   * Close the data point inspector drawer.
   */
  'ui.inspector.close': void;

  /**
   * Toggle cardinality drop simulation for a metric.
   */
  'ui.cardinality.simulateDrop': { key: string; drop: boolean };

  /**
   * Clear all application state.
   */
  'app.reset': void;
};

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


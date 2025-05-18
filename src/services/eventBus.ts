import mitt from 'mitt';
import type { EventTypes } from './eventTypes';

/**
 * Global mitt-based event channel for decoupled communication.
 *
 * The bus is a singleton that should be imported wherever cross-layer
 * communication is required. Use `bus.on` to listen for events and
 * `bus.emit` to broadcast new events.
 */
export const bus = mitt<EventTypes>();

/**
 * The type of the exported {@link bus} instance.
 */
export type EventBus = typeof bus;


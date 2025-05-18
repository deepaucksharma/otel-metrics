/**
 * @file src/hooks/useDropSimulation.ts
 * @summary useDropSimulation module
 * @layer Hooks
 * @remarks
 * Layer derived from Architecture-Principles.md.
 */
import { useState, useCallback } from 'react';

/**
 * Hold ephemeral UI state tracking which attribute key is being dropped for cardinality simulation.
 *
 * @remarks
 * This hook encapsulates a small piece of UI state local to the
 * `MetricInstanceWidget` component tree. It avoids touching global
 * state stores so that other parts of the UI do not re-render when
 * toggling drop simulation.
 *
 * @returns `[droppedKey, toggle]`
 * `droppedKey` - the currently dropped attribute key or `null`.
 * `toggle` - call with a key to toggle dropping that key. Calling
 * again with the same key resets it back to `null`.
 *
 * @internal
 * ## Logic
 * Uses React's `useState` to hold the current key and a `useCallback`
 * helper that compares the new key with the previous value. If the
 * same key is provided it resets to `null` (untoggle). Otherwise the
 * key is replaced.
 *
 * ## Dependencies
 * Relies only on React's `useState` and `useCallback` utilities.
 * No external runtime libraries are required.
 *
 * ## Tests
 * - initial state is `null`
 * - `toggle('http.method')` sets the key
 * - calling `toggle('http.method')` again resets to `null`
 * - `toggle('host.name')` switches the key
 */
export function useDropSimulation(): [string | null, (key: string | null) => void] {
  const [key, setKey] = useState<string | null>(null);

  const toggle = useCallback((next: string | null) => {
    setKey(prev => (prev === next ? null : next));
  }, []);

  return [key, toggle];
}

/**
 * @file src/hooks/useSnapshot.ts
 * @summary useSnapshot module
 * @layer Hooks
 * @remarks
 * Layer derived from Architecture-Principles.md.
 */
import { useStore } from 'zustand';
import { useMetricsSlice } from '@/state/metricsSlice';
import type { ParsedSnapshot } from '@/contracts/types';

/**
 * Get a `ParsedSnapshot` by id from {@link useMetricsSlice}.
 *
 * React components re-render only when the referenced snapshot object
 * in the store changes.
 *
 * @param id - Snapshot identifier. If falsy, `undefined` is returned.
 * @returns The snapshot matching the id, or `undefined` if absent.
 *
 * @remarks
 * Depends on the Zustand {@link useMetricsSlice} store defined in
 * `src/state/metricsSlice.ts`. Tests cover:
 * - returns undefined when id not set
 * - returns snapshot object when present
 * - re-renders only when that snapshot is replaced
 */
export function useSnapshot(
  id?: string | null,
): ParsedSnapshot | undefined {
  return useStore(useMetricsSlice, (state) =>
    id ? state.snapshots[id] : undefined,
  );
}

import { describe, beforeEach, it, expect } from 'vitest';
import { useMetricsSlice } from '../src/state/metricsSlice';
import type { ParsedSnapshot } from '../src/contracts/types';

function makeSnapshot(id: string, fileName: string): ParsedSnapshot {
  return {
    id,
    fileName,
    ingestionTimestamp: 0,
    resources: [],
  };
}

describe('metricsSlice', () => {
  beforeEach(() => {
    useMetricsSlice.getState().clearSnapshots();
  });

  it('markLoading tracks file name', () => {
    useMetricsSlice.getState().markLoading('foo.json');
    expect(useMetricsSlice.getState().loading['foo.json']).toBe(true);
  });

  it('registerError records message and clears loading', () => {
    const actions = useMetricsSlice.getState();
    actions.markLoading('bar.json');
    actions.registerError('bar.json', 'oops');
    const state = useMetricsSlice.getState();
    expect(state.errors['bar.json']).toBe('oops');
    expect(state.loading['bar.json']).toBeUndefined();
  });

  it('addSnapshot clears status for its file', () => {
    const actions = useMetricsSlice.getState();
    actions.markLoading('baz.json');
    actions.registerError('baz.json', 'err');
    actions.addSnapshot(makeSnapshot('id1', 'baz.json'));
    const state = useMetricsSlice.getState();
    expect(state.snapshots['id1']).toBeDefined();
    expect(state.errors['baz.json']).toBeUndefined();
    expect(state.loading['baz.json']).toBeUndefined();
  });
});

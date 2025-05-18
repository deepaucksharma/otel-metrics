import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { bus } from '../src/services/eventBus';
import { registerGlobalEventListeners } from '../src/services/eventListeners';
import { useMetricsSlice } from '../src/state/metricsSlice';
import useUiSlice from '../src/state/uiSlice';
import type { ParsedSnapshot } from '../src/contracts/types';

let cleanup: () => void;

function makeSnapshot(id: string, fileName: string): ParsedSnapshot {
  return { id, fileName, ingestionTimestamp: 0, resources: [] } as ParsedSnapshot;
}

describe('registerGlobalEventListeners', () => {
  beforeEach(() => {
    useMetricsSlice.getState().clearSnapshots();
    useUiSlice.getState().resetUi();
    cleanup = registerGlobalEventListeners();
  });

  afterEach(() => {
    cleanup();
  });

  it('handles data events', () => {
    bus.emit('data.snapshot.load.start', { fileName: 'a.json' });
    expect(useMetricsSlice.getState().loading['a.json']).toBe(true);

    bus.emit('data.snapshot.error', { fileName: 'a.json', error: 'err' });
    let state = useMetricsSlice.getState();
    expect(state.errors['a.json']).toBe('err');
    expect(state.loading['a.json']).toBeUndefined();

    const snap = makeSnapshot('id1', 'a.json');
    bus.emit('data.snapshot.parsed', { snapshot: snap });
    state = useMetricsSlice.getState();
    expect(state.snapshots['id1']).toEqual(snap);
    expect(state.errors['a.json']).toBeUndefined();
    expect(state.loading['a.json']).toBeUndefined();
  });

  it('handles ui events', () => {
    bus.emit('ui.inspector.open', { snapshotId: 's1', metricName: 'm1', seriesKey: 'm1|', pointId: 2 });
    let ui = useUiSlice.getState();
    expect(ui.activeSnapshotId).toBe('s1');
    expect(ui.inspectedMetricName).toBe('m1');
    expect(ui.inspectedSeriesKey).toBe('m1|');
    expect(ui.inspectedPointId).toBe(2);
    expect(ui.isInspectorOpen).toBe(true);

    bus.emit('ui.inspector.close');
    ui = useUiSlice.getState();
    expect(ui.isInspectorOpen).toBe(false);
  });
});

import { describe, beforeEach, it, expect } from 'vitest';
import { bus } from '../src/services/eventBus';
import { registerEventListeners } from '../src/services/eventListeners';
import { useMetricsSlice } from '../src/state/metricsSlice';

const sampleSnapshot = {
  id: 'snap1',
  fileName: 'file.json',
  ingestionTimestamp: 0,
  resources: [],
};

let cleanup: () => void;

describe('event listener integration', () => {
  beforeEach(() => {
    if (cleanup) cleanup();
    useMetricsSlice.setState({
      snapshots: {},
      snapshotOrder: [],
      loading: [],
      errors: [],
    });
    cleanup = registerEventListeners();
  });

  it('adds snapshot on loaded event', () => {
    bus.emit('data.snapshot.loaded', { snapshot: sampleSnapshot });
    expect(useMetricsSlice.getState().snapshots['snap1']).toEqual(sampleSnapshot);
  });

  it('tracks loading files', () => {
    bus.emit('data.snapshot.loading', { fileId: '1', fileName: 'foo.json' });
    expect(useMetricsSlice.getState().loading).toContain('foo.json');
  });

  it('records errors', () => {
    bus.emit('data.error', { message: 'oops' });
    expect(useMetricsSlice.getState().errors).toContain('oops');
  });
});

import { describe, it, beforeEach, expect, vi } from 'vitest';
import { registerEventListeners } from '../src/services/eventListeners';
import { bus as eventBus } from '../src/services/eventBus';
import { useMetricsSlice } from '../src/state/metricsSlice';
import type { ParsedSnapshot } from '../src/contracts/types';

function makeSnapshot(id: string, fileName: string): ParsedSnapshot {
  return { id, fileName, ingestionTimestamp: 0, resources: [] } as ParsedSnapshot;
}

describe('registerEventListeners', () => {
  beforeEach(() => {
    eventBus.off('*');
    useMetricsSlice.getState().clearSnapshots();
  });

  it('routes parsed events and logs others', () => {
    const metrics = useMetricsSlice.getState();
    const addSpy = vi.spyOn(metrics, 'addSnapshot');
    const errorSpy = vi.spyOn(metrics, 'registerError');
    const loadSpy = vi.spyOn(metrics, 'markLoading');
    const errLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    const debugLog = vi.spyOn(console, 'debug').mockImplementation(() => {});
    const cleanup = registerEventListeners();

    const snapshot = makeSnapshot('s1', 'f.json');
    eventBus.emit('data.snapshot.parsed', { snapshot });
    eventBus.emit('data.snapshot.error', { fileName: 'f.json', error: 'oops' });
    eventBus.emit('data.snapshot.load.start', { fileName: 'f.json' });

    expect(addSpy).toHaveBeenCalledWith(snapshot);
    expect(errorSpy).not.toHaveBeenCalled();
    expect(loadSpy).not.toHaveBeenCalled();
    expect(errLog).toHaveBeenCalled();
    expect(debugLog).toHaveBeenCalled();

    cleanup();

    addSpy.mockRestore();
    errorSpy.mockRestore();
    loadSpy.mockRestore();
    errLog.mockRestore();
    debugLog.mockRestore();
  });

  it('cleanup detaches listeners', () => {
    const metrics = useMetricsSlice.getState();
    const addSpy = vi.spyOn(metrics, 'addSnapshot');
    const cleanup = registerEventListeners();
    cleanup();
    const snapshot = makeSnapshot('s2', 'g.json');
    eventBus.emit('data.snapshot.parsed', { snapshot });
    expect(addSpy).not.toHaveBeenCalled();
    addSpy.mockRestore();
  });
});

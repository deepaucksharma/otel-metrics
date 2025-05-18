import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

class MockWorker {
  onmessage: ((e: MessageEvent<any>) => void) | null = null;
  onerror: ((e: any) => void) | null = null;
  static nextResponse: any;
  postMessage(data: any) {
    const resp = { taskId: data.taskId, ...MockWorker.nextResponse };
    queueMicrotask(() => this.onmessage?.({ data: resp } as any));
  }
  terminate() {}
}

describe('dispatchToParserWorker', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal('Worker', MockWorker);
    vi.stubGlobal('navigator', { hardwareConcurrency: 2 });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('resolves with worker success payload', async () => {
    MockWorker.nextResponse = { type: 'parsedSnapshot', payload: { id: 'ok' } };
    const mod = await import('../src/data/dispatchToWorker');
    const result = await mod.dispatchToParserWorker({ snapshotId: 's', fileName: 'f.json', rawJson: '{}' });
    expect(result).toEqual({ type: 'parsedSnapshot', payload: { id: 'ok' } });
    mod.terminateAllParserWorkers();
  });

  it('resolves with worker error payload', async () => {
    MockWorker.nextResponse = { type: 'parserError', payload: { snapshotId: 's', fileName: 'f', message: 'bad' } };
    const mod = await import('../src/data/dispatchToWorker');
    const result = await mod.dispatchToParserWorker({ snapshotId: 's', fileName: 'f.json', rawJson: '{}' });
    expect(result).toEqual(MockWorker.nextResponse);
    mod.terminateAllParserWorkers();
  });
});

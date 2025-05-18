import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { ValidFile } from '../src/data/fileValidator';

class MockFileReader {
  static buffer: ArrayBuffer | null = null;
  static shouldError = false;
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  readAsArrayBuffer(_file: File) {
    if (MockFileReader.shouldError) {
      queueMicrotask(() => this.onerror?.());
    } else {
      queueMicrotask(() => {
        (this as any).result = MockFileReader.buffer;
        this.onload?.();
      });
    }
  }
}

describe('readFileContent', () => {
  const file = new File(['dummy'], 'a.json');
  const gzFile = new File(['gz'], 'b.json.gz');

  beforeEach(() => {
    (global as any).FileReader = MockFileReader;
    MockFileReader.buffer = new TextEncoder().encode('text').buffer;
    MockFileReader.shouldError = false;
  });

  it('reads plain text files', async () => {
    const vf: ValidFile = { file, isGzipped: false };
    const { readFileContent } = await import('../src/data/readFile');
    const text = await readFileContent(vf);
    expect(text).toBe('text');
  });

  it('reads gzipped files via decompress', async () => {
    const vf: ValidFile = { file: gzFile, isGzipped: true };
    vi.mock('../src/data/decompressGzip', () => ({ decompressGzip: vi.fn().mockResolvedValue('unzipped') }));
    const { readFileContent } = await import("../src/data/readFile");
    const text = await readFileContent(vf);
    expect(text).toBe('unzipped');
  });

  it('propagates read errors', async () => {
    MockFileReader.shouldError = true;
    const vf: ValidFile = { file, isGzipped: false };
    const { readFileContent } = await import("../src/data/readFile");
    await expect(readFileContent(vf)).rejects.toThrow('File read error');
  });
});

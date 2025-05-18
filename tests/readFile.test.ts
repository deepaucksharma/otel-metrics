import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileContent } from '../src/data/readFile';
import type { ValidFile } from '../src/data/fileValidator';
import { decompressGzip } from '../src/data/decompressGzip';

vi.mock('../src/data/decompressGzip', () => ({
  decompressGzip: vi.fn(),
}));

const decompressMock = decompressGzip as unknown as ReturnType<typeof vi.fn>;

class MockFileReader {
  static nextBuffer: ArrayBuffer = new ArrayBuffer(0);
  static fail = false;

  result: ArrayBuffer | null = null;
  error: DOMException | null = null;
  onload: ((ev: any) => void) | null = null;
  onerror: ((ev: any) => void) | null = null;

  readAsArrayBuffer(_file: File) {
    if (MockFileReader.fail) {
      this.error = new DOMException('read fail');
      queueMicrotask(() => this.onerror?.(new Event('error')));
    } else {
      this.result = MockFileReader.nextBuffer;
      queueMicrotask(() => this.onload?.(new Event('load')));
    }
  }
}

function makeValidFile(name: string, isGz: boolean): ValidFile {
  const file = new File(['dummy'], name);
  return { file, isGzipped: isGz };
}

describe('readFileContent', () => {
  beforeEach(() => {
    vi.stubGlobal('FileReader', MockFileReader as any);
    decompressMock.mockReset();
    MockFileReader.fail = false;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads plain text files', async () => {
    const text = 'plain';
    MockFileReader.nextBuffer = new TextEncoder().encode(text).buffer;
    const vf = makeValidFile('a.json', false);
    const result = await readFileContent(vf);
    expect(result).toBe(text);
    expect(decompressMock).not.toHaveBeenCalled();
  });

  it('inflates gzipped files', async () => {
    const buffer = new ArrayBuffer(8);
    MockFileReader.nextBuffer = buffer;
    decompressMock.mockResolvedValue('unzipped');
    const vf = makeValidFile('b.json.gz', true);
    const result = await readFileContent(vf);
    expect(result).toBe('unzipped');
    expect(decompressMock).toHaveBeenCalledWith(buffer);
  });

  it('rejects on read error', async () => {
    MockFileReader.fail = true;
    const vf = makeValidFile('c.json', false);
    await expect(readFileContent(vf)).rejects.toThrow('File read error');
  });

  it('rejects when decompression fails', async () => {
    const buffer = new ArrayBuffer(1);
    MockFileReader.nextBuffer = buffer;
    decompressMock.mockRejectedValue(new Error('boom'));
    const vf = makeValidFile('d.json.gz', true);
    await expect(readFileContent(vf)).rejects.toThrow('boom');
  });
});

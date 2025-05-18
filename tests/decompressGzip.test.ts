import { describe, it, expect, vi } from 'vitest';
import { decompressGzip } from '../src/data/decompressGzip';

vi.mock('pako', () => ({ inflate: vi.fn() }));
import { inflate } from 'pako';

const textBuffer = new TextEncoder().encode('hello').buffer;

describe('decompressGzip', () => {
  it('returns inflated string', async () => {
    (inflate as unknown as vi.Mock).mockReturnValue('result');
    const res = await decompressGzip(textBuffer);
    expect(res).toBe('result');
    expect(inflate).toHaveBeenCalledWith(new Uint8Array(textBuffer), { to: 'string' });
  });

  it('throws on error', async () => {
    (inflate as unknown as vi.Mock).mockImplementation(() => { throw new Error('err'); });
    await expect(decompressGzip(textBuffer)).rejects.toThrow('Gzip decompression failed.');
  });
});

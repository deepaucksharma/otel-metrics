import { describe, it, expect } from 'vitest';
import { gzip } from 'pako';
import { decompressGzip } from '../src/data/decompressGzip';

describe('decompressGzip', () => {
  it('inflates a known sample', async () => {
    const text = 'hello world';
    const gz = gzip(text);
    const buffer = gz.buffer.slice(gz.byteOffset, gz.byteOffset + gz.byteLength);
    const result = await decompressGzip(buffer);
    expect(result).toBe(text);
  });

  it('throws on corrupt buffer', async () => {
    const buf = new Uint8Array([1, 2, 3]).buffer;
    await expect(decompressGzip(buf)).rejects.toThrow('Gzip decompression failed.');
  });

  it('does not modify the input buffer', async () => {
    const text = 'ok';
    const gz = gzip(text);
    const buffer = gz.buffer.slice(gz.byteOffset, gz.byteOffset + gz.byteLength);
    const copy = buffer.slice(0);
    await decompressGzip(buffer);
    expect(new Uint8Array(buffer)).toEqual(new Uint8Array(copy));
  });
});

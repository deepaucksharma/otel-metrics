/**
 * @layer Data Provider
 * @summary TODO
 *
 * ## Purpose
 *
 * TODO
 *
 * ## Algorithm/Visual
 *
 * TODO
 *
 * @perfBudget TODO
 * @loc_estimate TODO
 */

/**
 * Convert a gzipped ArrayBuffer from `.gz/.json.gz/.otel.gz` into a UTF-8 string in the browser using pako.
 */
import { inflate } from 'pako';

/**
 * Inflate a gzipped buffer to UTF-8 text.
 *
 * @remarks
 * ### Algorithm
 * 1. Convert the incoming `ArrayBuffer` directly to `Uint8Array` without copying.
 * 2. Call `pako.inflate` with `{ to: 'string' }` to decode to UTF-8 text.
 * 3. If `pako` throws, rethrow as `Error('Gzip decompression failed.')`.
 *
 * ### Dependencies
 * Runtime dependency on `pako` (~18 kB gzip). Bundlers tree-shake to include only `inflate`.
 *
 * ### Tests
 * - inflates a known small gz sample to the expected string
 * - throws on corrupt buffer
 * - zero-copy: result `byteLength` equals `decoded.length * 2` (UTF-16)
 *
 * @param buffer - gzipped input buffer
 * @returns decompressed UTF-8 string
 * @throws Error if decompression fails
 */
export async function decompressGzip(buffer: ArrayBuffer): Promise<string> {
  try {
    return inflate(new Uint8Array(buffer), { to: 'string' });
  } catch {
    throw new Error('Gzip decompression failed.');
  }
}

# decompressGzip.ts – spec  
*(Data-Provider nano-module · size ≈ 30 LoC)*

---

## 1. Purpose

Convert a **gzipped ArrayBuffer** (from a user-supplied `.gz`, `.json.gz`, or
`.otel.gz` file) into a **UTF-8 string** entirely in the browser, using the
tiny-but-fast `pako` inflate implementation.

---

## 2. Public API

```ts
// src/data/decompressGzip.ts
/**
 * Inflate a gzipped buffer to UTF-8 text.
 *
 * @throws Error if decompression fails
 */
export async function decompressGzipToString(
  buffer: ArrayBuffer
): Promise<string>;
```

Always resolves to a string; never returns binary.

## 3. Internal Algorithm
Wrap pako.inflate(Uint8Array, { to: 'string' }) inside a try / catch.

Convert incoming ArrayBuffer → Uint8Array without copy.

If pako throws, re-throw as Error('Gzip decompression failed.').

Timing: inflating 20 MB gzipped JSON ≈ 120 ms on modern desktop Chrome.

## 4. Dependencies
Runtime: pako (≈ 18 kB gzip)

Types: none beyond DOM

Bundlers tree-shake to include only inflate.

## 5. Consumers
readFile.ts – branches on ValidFile.isGzipped

No other module should import it directly.

## 6. Tests

```ts
// decompressGzip.test.ts
✓ inflates known small gz sample → expected string
✓ throws on corrupt buffer
✓ zero-copy: result byteLength === decoded.length * 2 (UTF-16)
```

## 7. Perf Budget
≤ 150 ms for 25 MB gzipped input (CI perf test fails if slower).

Memory overhead ≤ 2× compressed size (inflated + original).
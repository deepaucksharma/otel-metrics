# readFile.ts – spec  
*(Data-Provider nano-module · size ≈ 45 LoC)*

---

## 1. Purpose

Turn a **validated browser File** into a **UTF-8 string** ready for JSON
parsing:

1. Read file as `ArrayBuffer` with `FileReader`.
2. If `ValidFile.isGzipped` → inflate via `decompressGzipToString`.
3. Else decode buffer via `TextDecoder('utf-8')`.

---

## 2. Public API

```ts
// src/data/readFile.ts
import { ValidFile } from './fileValidator';

/**
 * Read the given file and return plain UTF-8 text.
 *
 * @throws Error on FileReader failure or decompression error
 */
export async function readFileContent(
  vf: ValidFile
): Promise<string>;
```

## 3. Internal Flow

```
FileReader.readAsArrayBuffer(vf.file)
 ├─ onload →
 │    if vf.isGzipped
 │        → decompressGzipToString(buffer)
 │    else
 │        → new TextDecoder('utf-8').decode(buffer)
 └─ onerror → reject(Error(`File read error: ${reader.error?.message}`))
```

Uses a single ArrayBuffer; no extra copies.

## 4. Dependencies
decompressGzipToString (nano-module #11)

DOM FileReader, TextDecoder

## 5. Consumers
dispatchToWorker.ts (nano-module #13): feeds worker with raw JSON string.

StaticFileProvider.tsx: orchestrates validation → read.

## 6. Tests

```ts
✓ returns plain text for small .json
✓ inflates .json.gz correctly
✓ propagates FileReader error
✓ propagates decompression error for bad gzip
```

## 7. Performance Benchmarks
| Size (gz) | Resulting text size | Time (ms) Chrome 104 |
|-----------|---------------------|----------------------|
| 2 MB | 16 MB | 25 ms |
| 20 MB | 160 MB | 260 ms |

Budget: ≤ 300 ms for 20 MB compressed.
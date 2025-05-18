# fileValidator.ts – spec  
*(Data-Provider nano-module · size ≈ 40 LoC)*

---

## 1. Purpose

Validate a user-selected **File** object **before** any expensive I/O:

* ensure the extension is supported (`.json`, `.gz`, `.json.gz`, `.otel`, `.otel.gz`);
* enforce a maximum size (default 100 MiB);
* return a typed Either so the caller can branch on success/failure without throwing.

---

## 2. Public API

```ts
// src/data/fileValidator.ts
export interface ValidationError {
  code   : 'INVALID_EXTENSION' | 'FILE_TOO_LARGE';
  message: string;
}

export interface ValidFile {
  file     : File;
  isGzipped: boolean;
}

/** Discriminated union: {type:'left'|'right', value:… } */
export type Either<L, R> =
  | { type: 'left';  value: L }
  | { type: 'right'; value: R };

/**
 * Validate file extension & size.
 *
 * @param file browser File object
 * @param maxBytes optional override, defaults 100 MiB
 */
export function validateFile(
  file: File,
  maxBytes = 100 * 1024 * 1024
): Either<ValidationError, ValidFile>;
```

Return semantics:

| Case | Return |
|------|--------|
| Good .json ≤ maxBytes | right({ file, isGzipped: false }) |
| Good .json.gz or .otel.gz | right({ file, isGzipped: true }) |
| Unsupported extension | left({ code:'INVALID_EXTENSION', … }) |
| Size > limit | left({ code:'FILE_TOO_LARGE', … }) |

## 3. Internal logic (pseudo)

```
ext ← last segment after final dot, lowercase
isZip ← filename endsWith '.gz'
if !(ext in allowed || isZip) ➜ INVALID_EXTENSION
if file.size > maxBytes          ➜ FILE_TOO_LARGE
return ValidFile
```

No MIME sniffing; extension check is sufficient for UI flow.

## 4. Dependencies
none (built-in File API)

## 5. Consumers
readFile.ts – needs the isGzipped flag

StaticFileProvider.tsx – shows validation errors to UI

## 6. Tests

```ts
// fileValidator.test.ts
✓ accepts '*.json'
✓ rejects '*.png'
✓ passes gzip flag
✓ enforces 100 MiB default
```

## 7. Future
If support for protobuf binary (.otel raw) is added, only ALLOWED_EXTENSIONS constant changes; rest of API stays stable.
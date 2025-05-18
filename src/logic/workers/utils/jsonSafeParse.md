# jsonSafeParse.ts – spec  
*(Parser-Worker nano-module · ≈ 25 LoC)*

---

## 1. Purpose

Provide a **zero-dependency**, side-effect-free helper that converts raw
JSON text → JS object inside the worker, but **never throws**.  
Instead returns a simple Either so the caller can branch without a try/catch.

---

## 2. Public API

```ts
// src/logic/workers/utils/jsonSafeParse.ts
export type Either<L, R> =
  | { type: 'left';  value: L }
  | { type: 'right'; value: R };

/**
 * Safely parse JSON string.
 *
 * @return right(object) on success,
 *         left(Error)   on failure (message + stack preserved).
 */
export function jsonSafeParse<T = any>(
  jsonText: string
): Either<Error, T>;
```

## 3. Internal Logic

```
try  { obj = JSON.parse(jsonText); return right(obj); }
catch(err) {
  if not instanceOf Error → wrap in Error('Unknown parse error');
  return left(err);
}
```

No additional validation—schema correctness is handled later by otlpMapper.

## 4. Dependencies
None (pure ES).

## 5. Consumers
parser.worker.ts – first step after receiving rawJson.

## 6. Tests
| Case | Expect |
|------|--------|
| Valid JSON {} | type = right |
| Invalid foo{ | type = left, .value.message contains "Unexpected token" |
| Large 10 MB string | parses < 20 ms |

## 7. Performance
10 MB JSON parse ≤ 20 ms in dedicated worker on 3 GHz laptop.

No heap allocations beyond JSON.parse.

## 8. Stability Contract
Function signature MUST NOT change without major version bump because many
worker utilities inline-import it.
# uniqueValueCounter.ts – spec  
*(Metric-Processor nano-module · ≈ 35 LoC)*

---

## 1. Purpose

Provide two ultra-simple yet hot-path helpers used by attribute-level
cardinality calculations:

1. **`getUniqueValues()`** – return a `Set` of distinct attribute values.
2. **`countUniqueValues()`** – fast count without exposing the Set.

These run on *every* series of a metric, so must be allocation-lean.

---

## 2. Public API

```ts
// src/logic/processing/utils/uniqueValueCounter.ts
import type { AttrValue, UniqueCount } from '@/contracts/types';

/** O(N) pass that builds and returns a Set of unique primitives. */
export function getUniqueValues(
  values: Iterable<AttrValue>
): Set<AttrValue>;

/** O(N) pass that returns just the size; no intermediate Set kept. */
export function countUniqueValues(
  values: Iterable<AttrValue>
): UniqueCount;
```

## 3. Internal Algorithm
For both functions we avoid spread/array conversions:

```ts
const set = new Set<AttrValue>();
for (const v of values) set.add(v);
return set;         // getUniqueValues
return set.size;    // countUniqueValues
```

Primitive inserts in V8's Set are near-constant time.

## 4. Dependencies
Only type imports from contracts/types.ts.

## 5. Consumers
| Module | Which fn | Why |
|--------|----------|-----|
| attributeStats.ts | both | per-attribute uniq view |
| Future global cardinality map | possibly | entire dataset scan |

## 6. Tests

```ts
✓ counts unique strings
✓ counts unique numbers + bools
✓ treats '42' (string) ≠ 42 (number)
✓ empty iterable → size 0 / Set(size 0)
```

Run under Jest; 100 k values benchmark must finish < 5 ms on CI machine.

## 7. Performance
Memory – One Set plus loop index; GC shortly after consumer releases.
Time – ~12 ns / insert on Node 18 (JIT warm), i.e. 100 k elements ~1.2 ms.

## 8. Future
If attribute values become objects/arrays (unlikely for OTLP), this util still works because Set identity is by reference; higher-level mapping will handle deep equality if ever needed.
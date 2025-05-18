# jaccardEstimator.ts – spec
*(Metric-Processor nano-module · ≈ 30 LoC)*

---

## 1. Purpose

Estimate the Jaccard similarity between two sets of attributes. This helps gauge how similar two series are when comparing or merging metric data.

---

## 2. Public API

```ts
// src/logic/processing/jaccardEstimator.ts
import type { AttrMap } from '@/contracts/types';

/**
 * Return a float in the range `[0,1]` representing how similar the two
 * attribute maps are. `1` means identical key/value pairs, `0` means no
 * overlap at all.
 */
export function estimateJaccard(
  setA: AttrMap,
  setB: AttrMap
): number;
```

---

## 3. Algorithm

```pseudo
intersect = 0
unionKeys = unique keys of setA and setB
for key in unionKeys:
    if key in setA and key in setB and setA[key] == setB[key]:
        intersect += 1
return intersect / unionKeys.size
```

Expected complexity: `O(|A| + |B|)` where `|A|` and `|B|` are the number of
entries in each map.

---

## 4. Dependencies
- Only type imports from `contracts/types.ts`.
- No runtime dependencies.

---

## 5. Consumers
- Planned metric deduplication heuristics.
- Potential "similar series" suggestions in the Inspector UI.

---

## 6. Tests

| setA | setB | expect |
|------|------|-------|
| `{}` | `{}` | `1` |
| `{a: 1, b: 2}` | `{a: 1, b: 2}` | `1` |
| `{a: 1}` | `{b: 2}` | `0` |
| `{a: 1, b: 2}` | `{a: 1, b: 3}` | `0.5` |


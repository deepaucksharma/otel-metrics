# attributeStats.ts – spec  
*(Metric-Processor nano-module · ≈ 75 LoC)*

---

## 1. Purpose

For **one metric inside one snapshot**, compute:

| Output field   | Meaning                                                     |
| -------------- | ----------------------------------------------------------- |
| `attrUniq`     | `{ key → unique-value count }` across **all series**        |
| `attrRank`     | `string[]` of keys, sorted **desc** by their unique counts  |

These stats feed the Inspector's *C-Ring* arc, *B-MiniBars* and *P-Rarity Dots*.

---

## 2. Public API

```ts
// src/logic/processing/attributeStats.ts
import type { ParsedMetricData, UniqueCount } from '@/contracts/types';

export interface AttributeStatistics {
  attrUniq: Record<string, UniqueCount>;
  attrRank: string[];
}

/**
 * Gather uniqueness counts for every attribute key of a metric.
 */
export function calculateAttributeStatsForMetric(
  metric: ParsedMetricData
): AttributeStatistics;
```

## 3. Algorithm

```
collector: Map<key, Set>
for each series in metric.seriesData.values():
    for each (k,v) in series.resourceAttributes   → add to Set
    for each (k,v) in series.metricAttributes     → add to Set
attrUniq = { k: set.size }
attrRank = keys sorted by size DESC
```

Uses getUniqueValues() helper when creating each Set.

Time complexity: O(S × A) where S = series count, A = attribute keys per series.

## 4. Dependencies
uniqueValueCounter.ts (for getUniqueValues)

Type imports from contracts/types.ts

No state or UI imports.

## 5. Consumers
metricProcessor.ts — builds full MetricCardinalityContext.

Future "Global Cardinality Heat-map" feature (not in Inspector 1.1).

## 6. Tests
| Scenario | Expect |
|----------|--------|
| 3 series, shared host.name | attrUniq['host.name'] === 1 |
| Mixed resource & metric attrs | counts merged properly |
| Keys with 5,3,1 uniques → attrRank | ['http.method','k8s.pod','host.name'] |
| Empty metric.seriesData | returns empty objects |

Benchmark: 100 k series × 6 attrs → < 25 ms on Node 18 (CI perf guard).

## 7. Memory Footprint
Creates at most one Set per distinct key; after function return only
simple numbers/arrays remain — GC of Sets is immediate.

## 8. Extension Points
If we later need value samples (e.g., top-N exemplars per key), extend return
type with attrSamples: Record<string, AttrValue[]> without breaking current
fields. Keep counts path hot.
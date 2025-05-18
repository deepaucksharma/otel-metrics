# metricProcessor.ts – spec  
*(Metric-Processor façade · ≈ 120 LoC)*

---

## 1. Purpose

Provide a single, easy-to-use API for UI hooks:

* **`getProcessedMetricInfo`**  
  → returns the **MetricDefinition** + **MetricCardinalityContext**  
  (optionally with a simulated attribute drop).

This hides the details of uniqueness stats and series-count maths.

---

## 2. Public API

```ts
// src/logic/metricProcessor.ts
import type {
  ParsedSnapshot,
  ProcessedMetricInfo,
  SeriesCount
} from '@/contracts/types';

export interface ProcessMetricOptions {
  simulateDropAttributeKey?: string;
}

/**
 * Compute cardinality context for a metric inside a snapshot.
 *
 * @return null if metric not found.
 */
export function getProcessedMetricInfo(
  snapshot: ParsedSnapshot,
  metricName: string,
  opts?: ProcessMetricOptions
): ProcessedMetricInfo | null;
```

## 3. Internal Steps
Lookup metric

```ts
function findMetric(snapshot, metricName) → ParsedMetricData | undefined
```

Traverse snapshot.resources[].scopes[].metrics[].

Attribute stats

```ts
stats = calculateAttributeStatsForMetric(metric)
```

Series count

```ts
baseCount = getActualSeriesCount(metric)

if (opts?.simulateDropAttributeKey)
    seriesCount = simulateDroppedAttributesSeriesCount(metric, [opts.simulateDropAttributeKey])
else
    seriesCount = baseCount
```

Assemble

```ts
return {
  definition: metric.definition,
  cardinality: {
    seriesCount,
    attrUniq : stats.attrUniq,
    attrRank : stats.attrRank,
  }
}
```

## 4. Cache Strategy (optional)
Large snapshots may re-request the same metric many times (hover, etc.).
We provide a tiny in-memory cache:

```ts
const cache = new WeakMap<ParsedMetricData, ProcessedMetricInfo>();
// keyed by ParsedMetricData object reference
```

Invalidate only when different simulateDropAttributeKey requested.

## 5. Dependencies
attributeStats.ts

seriesCardinalityCalc.ts

Types from contracts/types.ts

No state or UI imports—pure logic.

## 6. Consumers
| Layer / Hook | Purpose |
|--------------|---------|
| hooks/useInspectorProps.ts | Build props for the Data-Point Inspector |
| Future dashboard "metric list" | show numSeries badge |

## 7. Tests
| Scenario | Expect |
|----------|--------|
| Metric absent | returns null |
| Metric present, no simulation | seriesCount matches metric.seriesData.size |
| Simulate drop of key not present | seriesCount unchanged |
| Simulate drop reduces count correctly | value below original |
| Cache hit | second call same object is referentially equal |

Perf: Recomputing 100 k-series metric < 35 ms.

## 8. Performance & Memory
CPU cost dominated by attributeStats + series drop calc (benchmarked prior).

Cache retains at most 1 entry per distinct metric object → bounded.

## 9. Extension Roadmap
Accept multiple simulateDropAttributeKeys[] (Inspector v2).

Provide pre-computed snapshot-wide map to speed repeated metric access.
# otlpMapper.ts – spec  
*(Parser-Worker nano-module · ≈ 140 LoC)*

---

## 1. Purpose

Convert the raw **OTLP JSON** payload (`ExportMetricsServiceRequest`) into the
Explorer's internal **`ParsedSnapshot`** graph, ready for metric-level
processing and UI consumption.

Key duties:

1. Traverse `resourceMetrics → scopeMetrics → metrics → dataPoints`.
2. Produce **strictly typed** structures from `contracts/types.ts`.
3. Generate stable `SeriesKey` per series via `seriesKeyEncoder`.
4. Attach `ExemplarData` via `extractExemplars`.
5. Preserve **all** attributes (resource + metric) for later cardinality math.

---

## 2. Public API

```ts
// src/logic/workers/mapping/otlpMapper.ts
import type { RawOtlpExportMetricsServiceRequest } from '@/contracts/rawOtlpTypes';
import type { ParsedSnapshot } from '@/contracts/types';

/**
 * Transform a parsed OTLP JSON object into ParsedSnapshot.
 *
 * @throws Error on unsupported metric/data-point shape.
 */
export function mapToParsedSnapshot(
  raw: RawOtlpExportMetricsServiceRequest,
  snapshotId: string,
  fileName: string
): ParsedSnapshot;
```

Does not JSON.parse—caller (workerMain) already supplied object.

## 3. Instrument-type Mapping Table
| OTLP field present | instrumentType | temporality rule | isMonotonic |
|--------------------|----------------|------------------|-------------|
| gauge.dataPoints | Gauge | Unspecified | undefined |
| sum.dataPoints | Sum | Map enum AGGREGATION_TEMPORALITY_* → string | copy |
| histogram.dataPoints | Histogram | same enum mapping | undefined |
| (future) summary.dataPoints | Summary | Unspecified | n/a |

Unsupported combo ➜ instrumentType = 'Unknown', dataPoint mapping throws.

## 4. Data-Point Mapping Rules
Number point
```ts
{
  value: asDouble ?? Number(asInt)
}
```

Histogram point
bucketCounts[] → number[]

explicitBounds[] may be missing → []

min, max only from SDK ≥ 1.17.

Attributes:

resourceAttrs: from resource level.

metricAttrs: point.attributes (OTLP label set).

## 5. SeriesKey Generation

```
seriesKey = encodeSeriesKey(
  metricName,
  resourceAttrs,
  metricAttrs    // metric overrides duplicates
)
```

Stored once per ParsedSeriesData, reused for all its points.

## 6. Pseudocode Walkthrough

```ts
const snapshot: ParsedSnapshot = { id, fileName, ingestionTimestamp: Date.now(), resources: [] };

for each res of raw.resourceMetrics:
  rAttrs = mapAttrs(res.resource.attributes);
  rNode  = { resourceAttributes: rAttrs, scopes: [] };

  for each scope of res.scopeMetrics:
    sNode = { scopeName, scopeVersion, scopeAttributes: mapAttrs(scope.scope.attributes), metrics: [] };

    for each m of scope.metrics:
      def  = deriveMetricDefinition(m);
      map  = new Map<SeriesKey, ParsedSeriesData>();

      ptsArray = extractDataPoints(m);
      for each pt of ptsArray:
        mAttrs = mapAttrs(pt.attributes);
        sKey = encodeSeriesKey(def.name, rAttrs, mAttrs);
        parsedPt = mapPoint(pt, def.instrumentType);

        if !map.has(sKey) → map.set(sKey, { seriesKey:sKey, resourceAttributes:rAttrs, metricAttributes:mAttrs, points:[] });
        map.get(sKey)!.points.push(parsedPt);
      end

      sNode.metrics.push({ definition:def, seriesData:map });
    end
    rNode.scopes.push(sNode);
  end
  snapshot.resources.push(rNode);
end

return snapshot;
```

## 7. Error Strategy
Structural missing fields → throw Error('Unsupported OTLP metric shape: …')
(workerMain catches and posts parserError).

Point type mismatch → same.

Worker keeps running; only faulty file fails.

## 8. Performance Notes
| Dataset | Size | Mapping time (worker) |
|---------|------|-----------------------|
| 100 k series, 1 pt | 25 MB | ~110 ms |
| 10 k series, 10 pts | 18 MB | ~85 ms |

No intermediate arrays beyond what GC needs; reuses attribute maps where safe.

## 9. Tests
Fixture: minimal gauge → parses 1 series.

Histogram with exemplars → exemplar array length matches.

Duplicate attr order produces single series (order-insensitivity).

Unknown metric kind → throws.

Performance benchmark (jest) < 150 ms for 25 MB fixture.

## 10. Extensibility
When OpenTelemetry adds ExponentialHistogram:

extend instrumentType map, add new point mapper branch.

Contracts stay same (HistogramDataPoint vs new type alias).

Any breaking field rename needs major version bump.
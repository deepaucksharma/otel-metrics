# Data Contracts (`src/contracts/types.ts`)

> **Single source of truth** for every structure exchanged between nano-modules.

---

## 0. Conventions

* ✅ All timestamps use **Unix nanoseconds** (`TimestampUnixNano = number`).  
* ✅ `AttrValue` is primitive only → `string | number | boolean`.  
* ✅ CamelCase field names match OTLP JSON after transformation.  
* 🚫 No optional `null`; omit key instead.

---

## 1. Primitive & Utility Types

```ts
export type TimestampUnixNano = number;
export type AttrValue = string | number | boolean;
export type AttrMap    = Record<string, AttrValue>;

/** Canonical series identifier: "metricName|a=b|c=d" (keys sorted) */
export type SeriesKey  = string;

/** Brand helpers to avoid mixing logically distinct numbers */
export type SeriesCount   = number & { __brand: 'SeriesCount' };
export type UniqueCount   = number & { __brand: 'UniqueCount' };
```

## 2. Parsed OTLP Snapshot Model
(output of Parser Worker)

```ts
export interface ExemplarData {
  timeUnixNano : TimestampUnixNano;
  value        : number;
  spanId?      : string;
  traceId?     : string;
  attributes   : AttrMap;
}

interface BasePoint {
  timestampUnixNano : TimestampUnixNano;
  startTimeUnixNano?: TimestampUnixNano;
  attributes        : AttrMap;
  exemplars?        : ExemplarData[];
}

export interface NumberDataPoint    extends BasePoint { value: number; }
export interface HistogramDataPoint extends BasePoint {
  count         : number;
  sum?          : number;
  bucketCounts  : number[];
  explicitBounds: number[];
  min?          : number;
  max?          : number;
}

export type ParsedPoint = NumberDataPoint | HistogramDataPoint;

export interface ParsedSeriesData {
  seriesKey         : SeriesKey;
  resourceAttributes: AttrMap;
  metricAttributes  : AttrMap;
  points            : ParsedPoint[];   // often length == 1 for static snapshot
}

export interface MetricDefinition {
  name          : string;
  description?  : string;
  unit?         : string;
  instrumentType: 'Gauge' | 'Sum' | 'Histogram' | 'Summary' | 'Unknown';
  temporality?  : 'Delta' | 'Cumulative' | 'Unspecified';
  isMonotonic?  : boolean;
}

export interface ParsedMetricData {
  definition : MetricDefinition;
  seriesData : Map<SeriesKey, ParsedSeriesData>;
}

export interface ParsedScopeData {
  scopeName?       : string;
  scopeVersion?    : string;
  scopeAttributes? : AttrMap;
  metrics          : ParsedMetricData[];
}

export interface ParsedResourceData {
  resourceAttributes: AttrMap;
  scopes            : ParsedScopeData[];
}

export interface ParsedSnapshot {
  id                : string;     // generated on load
  fileName          : string;
  ingestionTimestamp: number;     // Unix ms, not nano
  resources         : ParsedResourceData[];
}
```

## 3. Metric-level Cardinality Context
(output of Metric Processor)

```ts
export interface MetricCardinalityContext {
  seriesCount: SeriesCount;
  attrUniq   : Record<string, UniqueCount>; // key → uniq values
  attrRank   : string[];                    // sorted desc by uniq count
}
export interface ProcessedMetricInfo {
  definition : MetricDefinition;
  cardinality: MetricCardinalityContext;
}
```

## 4. Inspector Props
(consumed by DataPointInspectorDrawer)

```ts
export interface InspectorProps {
  /** Identity & raw data */
  metricName : string;
  seriesKey  : SeriesKey;
  point      : ParsedPoint;
  resourceAttrs: AttrMap;
  metricAttrs  : AttrMap;

  /** Schema & cardinality */
  metricDefinition: MetricDefinition;
  cardinality : {
    seriesCount : SeriesCount;
    attrUniq    : Record<string, UniqueCount>;
    attrRank    : string[];
    attrOfPoint : string[];   // keys present in this series
    thresholdHigh: SeriesCount; // for C-Ring colour ramp
  };

  /** Exemplars */
  exemplars?: ExemplarData[];

  /** Callbacks */
  onClose        : () => void;
  onAddGlobalFilter?: (key: string, value: AttrValue) => void; // adds a filter chip in host UI
  onSimulateDrop?: (attributeKey: string, isDropped: boolean) => void;

  /** Optional micro-trend sparkline */
  metricLatestNValues?: number[];
}
```

`onAddGlobalFilter` requests that the host UI add a corresponding filter chip. The field remains optional in Inspector **v1.1** and may be fully adopted in a later version.

## 5. Raw OTLP helper types
rawOtlpTypes.ts mirrors the JSON produced by otelcol protobuf-JSON.
We keep it in a separate file to avoid polluting app contracts.

## 6. Versioning Notice
Any breaking change to this file triggers a major bump in package.json
and must include automated codemod or migration notes in CHANGELOG.md.
/**
 * Single source of truth for all data structures exchanged between nano-modules.
 *
 * ## Conventions
 * - All timestamps use Unix nanoseconds (`TimestampUnixNano`).
 * - `AttrValue` is primitive only (`string | number | boolean`).
 * - CamelCase field names mirror OTLP JSON after transformation.
 * - No optional `null` values; omit the key instead.
 */

export type TimestampUnixNano = number;
/** Primitive attribute value. */
export type AttrValue = string | number | boolean;
/** Map of attribute keys to primitive values. */
export type AttrMap = Record<string, AttrValue>;

/** Canonical series identifier "metricName|a=b|c=d" with sorted keys. */
export type SeriesKey = string;

/** Branded count of series to avoid unit confusion. */
export type SeriesCount = number & { __brand: 'SeriesCount' };
/** Branded count of unique attribute values. */
export type UniqueCount = number & { __brand: 'UniqueCount' };

/** Exemplar attached to a metric point. */
export interface ExemplarData {
  /** Time the exemplar was recorded (Unix nanoseconds). */
  timeUnixNano: TimestampUnixNano;
  /** Numeric value of the exemplar. */
  value: number;
  /** Optional span ID associated with the exemplar. */
  spanId?: string;
  /** Optional trace ID associated with the exemplar. */
  traceId?: string;
  /** Key/value attributes carried by the exemplar. */
  attributes: AttrMap;
}

/** Common shape shared by all metric points. */
interface BasePoint {
  /** Timestamp of the measurement in Unix nanoseconds. */
  timestampUnixNano: TimestampUnixNano;
  /** Optional start time for delta temporality. */
  startTimeUnixNano?: TimestampUnixNano;
  /** Attributes specific to this point. */
  attributes: AttrMap;
  /** Exemplars attached to this point. */
  exemplars?: ExemplarData[];
}

/** Numeric point containing a single value. */
export interface NumberDataPoint extends BasePoint {
  /** Measurement value. */
  value: number;
}

/** Histogram point capturing distribution information. */
export interface HistogramDataPoint extends BasePoint {
  /** Total count of recorded measurements. */
  count: number;
  /** Sum of measurements when provided. */
  sum?: number;
  /** Cumulative bucket counts. */
  bucketCounts: number[];
  /** Upper bounds for each bucket. */
  explicitBounds: number[];
  /** Minimum observed value. */
  min?: number;
  /** Maximum observed value. */
  max?: number;
}

export type ParsedPoint = NumberDataPoint | HistogramDataPoint;

/** Parsed metric series after OTLP mapping. */
export interface ParsedSeriesData {
  /** Canonical identifier for the series. */
  seriesKey: SeriesKey;
  /** Attributes present at the resource level. */
  resourceAttributes: AttrMap;
  /** Attributes present at the metric level. */
  metricAttributes: AttrMap;
  /** Data points for this series (often length 1 for snapshots). */
  points: ParsedPoint[];
}

/** Definition metadata for a metric. */
export interface MetricDefinition {
  /** Metric name. */
  name: string;
  /** Optional description. */
  description?: string;
  /** Unit of measure. */
  unit?: string;
  /** Instrument type from OTLP. */
  instrumentType: 'Gauge' | 'Sum' | 'Histogram' | 'Summary' | 'Unknown';
  /** Data aggregation temporality. */
  temporality?: 'Delta' | 'Cumulative' | 'Unspecified';
  /** Whether the sum is monotonic. */
  isMonotonic?: boolean;
}

/** Parsed metric containing series data and definition. */
export interface ParsedMetricData {
  /** Metric definition metadata. */
  definition: MetricDefinition;
  /** Map of series data keyed by the series identifier. */
  seriesData: Map<SeriesKey, ParsedSeriesData>;
}

/** Instrumentation scope grouping of metrics. */
export interface ParsedScopeData {
  /** Optional scope name. */
  scopeName?: string;
  /** Optional scope version. */
  scopeVersion?: string;
  /** Optional scope attributes. */
  scopeAttributes?: AttrMap;
  /** Metrics produced by this scope. */
  metrics: ParsedMetricData[];
}

/** Resource grouping inside a snapshot. */
export interface ParsedResourceData {
  /** Attributes describing the resource. */
  resourceAttributes: AttrMap;
  /** Scopes recorded for the resource. */
  scopes: ParsedScopeData[];
}

/** Complete snapshot parsed from OTLP. */
export interface ParsedSnapshot {
  /** Unique ID generated on load. */
  id: string;
  /** Original file name of the snapshot. */
  fileName: string;
  /** Ingestion timestamp in Unix milliseconds. */
  ingestionTimestamp: number;
  /** Resources contained in this snapshot. */
  resources: ParsedResourceData[];
}

/** Cardinality information produced by the Metric Processor. */
export interface MetricCardinalityContext {
  /** Total number of unique series. */
  seriesCount: SeriesCount;
  /** Map of attribute keys to their unique value counts. */
  attrUniq: Record<string, UniqueCount>;
  /** Attribute keys ranked by unique count descending. */
  attrRank: string[];
}

/** Metric definition paired with cardinality context. */
export interface ProcessedMetricInfo {
  /** Metric definition metadata. */
  definition: MetricDefinition;
  /** Calculated cardinality information. */
  cardinality: MetricCardinalityContext;
}

/** Props consumed by DataPointInspectorDrawer. */
export interface InspectorProps {
  // Identity & raw data
  /** Name of the metric. */
  metricName: string;
  /** Series key identifying the series. */
  seriesKey: SeriesKey;
  /** Data point instance. */
  point: ParsedPoint;
  /** Attributes at resource level. */
  resourceAttrs: AttrMap;
  /** Attributes at metric level. */
  metricAttrs: AttrMap;

  // Schema & cardinality
  /** Metric definition describing the series. */
  metricDefinition: MetricDefinition;
  /** Cardinality details for the metric. */
  cardinality: {
    /** Total series count for the metric. */
    seriesCount: SeriesCount;
    /** Unique attribute value counts. */
    attrUniq: Record<string, UniqueCount>;
    /** Attribute keys ranked by unique count. */
    attrRank: string[];
    /** Keys present in this series. */
    attrOfPoint: string[];
    /** Threshold for high cardinality colouring. */
    thresholdHigh: SeriesCount;
  };

  /** Exemplars attached to this point. */
  exemplars?: ExemplarData[];

  // Callbacks
  /** Close the inspector UI. */
  onClose: () => void;
  /**
   * Request the host UI to add a corresponding filter chip. Optional in
   * Inspector v1.1 and subject to later adoption.
   */
  onAddGlobalFilter?: (key: string, value: AttrValue) => void;
  /** Simulate dropping or restoring an attribute. */
  onSimulateDrop?: (attributeKey: string, isDropped: boolean) => void;

  /** Recent values for micro-trend sparkline. */
  metricLatestNValues?: number[];
}

/*
 * rawOtlpTypes.ts mirrors the JSON produced by otelcol protobuf-JSON.
 * We keep it in a separate file to avoid polluting app contracts.
 *
 * Any breaking change to this file triggers a major bump in package.json
 * and must include automated codemod or migration notes in CHANGELOG.md.
 */

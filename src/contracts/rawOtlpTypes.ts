/**
 * @layer Contracts
 * @summary TODO
 *
 * ## Purpose
 *
 * TODO
 *
 * ## Algorithm/Visual
 *
 * TODO
 *
 * @perfBudget TODO
 * @loc_estimate TODO
 */

// Worker-only schema mirror of the protobuf JSON representation.

/**
 * Top-level OTLP export containing metric resources.
 * Used exclusively within parser and mapping workers.
 */
export interface RawOtlpExportMetricsServiceRequest {
  resourceMetrics: RawOtlpResourceMetrics[];
}

/** Resource-level wrapper for scope metrics. */
export interface RawOtlpResourceMetrics {
  resource?: {
    attributes?: RawOtlpKeyValue[];
  };
  scopeMetrics: RawOtlpScopeMetrics[];
}

/** Instrumentation scope grouping of metrics. */
export interface RawOtlpScopeMetrics {
  scope?: {
    name?: string;
    version?: string;
    attributes?: RawOtlpKeyValue[];
  };
  metrics: RawOtlpMetric[];
}

/** Single metric definition with data point collections. */
export interface RawOtlpMetric {
  name       : string;
  description?: string;
  unit?      : string;
  gauge?     : { dataPoints: RawOtlpNumberDataPoint[] };
  sum?       : {
    dataPoints           : RawOtlpNumberDataPoint[];
    aggregationTemporality?: number;
    isMonotonic?          : boolean;
  };
  histogram?: {
    dataPoints           : RawOtlpHistogramDataPoint[];
    aggregationTemporality?: number;
  };
}

/** Numeric data point in OTLP JSON form. */
export interface RawOtlpNumberDataPoint {
  attributes?       : RawOtlpKeyValue[];
  timeUnixNano      : string;
  startTimeUnixNano?: string;
  asInt?            : string;
  asDouble?         : number;
  exemplars?        : RawOtlpExemplar[];
}

/** Histogram data point in OTLP JSON form. */
export interface RawOtlpHistogramDataPoint {
  attributes?       : RawOtlpKeyValue[];
  timeUnixNano      : string;
  startTimeUnixNano?: string;
  count             : string;
  sum?              : number;
  bucketCounts      : string[];
  explicitBounds    : number[];
  min?              : number;
  max?              : number;
  exemplars?        : RawOtlpExemplar[];
}

/** Raw exemplar attached to number or histogram points. */
export interface RawOtlpExemplar {
  timeUnixNano      : string;
  asInt?            : string;
  asDouble?         : number;
  spanId?           : string;
  traceId?          : string;
  filteredAttributes?: RawOtlpKeyValue[];
}

/** Key/value pair used in OTLP attribute arrays. */
export interface RawOtlpKeyValue {
  key  : string;
  value: {
    stringValue?: string;
    intValue?   : string;
    doubleValue?: number;
    boolValue?  : boolean;
  };
}

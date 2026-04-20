import type {
  RawOtlpKeyValue,
  RawOtlpNumberDataPoint,
  RawOtlpHistogramDataPoint,
} from '@intellimetric/contracts/rawOtlpTypes';
import type { AttrMap, ParsedPoint, MetricDefinition } from '@intellimetric/contracts/types';
import { extractExemplars } from '../utils/exemplarExtractor';

/** Map OTLP attribute list into a simple key/value map. */
export function mapAttrs(raw?: RawOtlpKeyValue[] | null): AttrMap {
  const out: AttrMap = {};
  if (!raw) return out;
  for (const kv of raw) {
    if (!kv || !kv.value) continue;
    const v = kv.value as any;
    if (v.stringValue !== undefined) out[kv.key] = v.stringValue;
    else if (v.doubleValue !== undefined) out[kv.key] = v.doubleValue;
    else if (v.intValue !== undefined) out[kv.key] = Number(v.intValue);
    else if (v.boolValue !== undefined) out[kv.key] = v.boolValue;
  }
  return out;
}

/** Convert OTLP temporality enum into a friendly string. */
export function mapTemporality(
  t: number | undefined,
): 'Delta' | 'Cumulative' | 'Unspecified' {
  switch (t) {
    case 1:
      return 'Delta';
    case 2:
      return 'Cumulative';
    default:
      return 'Unspecified';
  }
}

function mapNumberPoint(raw: RawOtlpNumberDataPoint): ParsedPoint {
  return {
    timestampUnixNano: Number(raw.timeUnixNano),
    startTimeUnixNano: raw.startTimeUnixNano ? Number(raw.startTimeUnixNano) : undefined,
    value: raw.asDouble ?? Number(raw.asInt ?? 0),
    attributes: mapAttrs(raw.attributes),
    exemplars: extractExemplars(raw.exemplars),
  };
}

function mapHistogramPoint(raw: RawOtlpHistogramDataPoint): ParsedPoint {
  return {
    timestampUnixNano: Number(raw.timeUnixNano),
    startTimeUnixNano: raw.startTimeUnixNano ? Number(raw.startTimeUnixNano) : undefined,
    count: Number(raw.count),
    sum: raw.sum !== undefined ? Number(raw.sum) : undefined,
    bucketCounts: (raw.bucketCounts || []).map(Number),
    explicitBounds: (raw.explicitBounds || []).map(Number),
    min: raw.min !== undefined ? Number(raw.min) : undefined,
    max: raw.max !== undefined ? Number(raw.max) : undefined,
    attributes: mapAttrs(raw.attributes),
    exemplars: extractExemplars(raw.exemplars),
  };
}

/** Map raw data point into a typed ParsedPoint based on metric kind. */
export function mapPoint(
  raw: RawOtlpNumberDataPoint | RawOtlpHistogramDataPoint,
  type: MetricDefinition['instrumentType'],
): ParsedPoint {
  if (type === 'Gauge' || type === 'Sum') return mapNumberPoint(raw as RawOtlpNumberDataPoint);
  if (type === 'Histogram') return mapHistogramPoint(raw as RawOtlpHistogramDataPoint);
  throw new Error('Unsupported OTLP metric shape: ' + type);
}

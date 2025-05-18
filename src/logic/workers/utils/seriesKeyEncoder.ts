/**
 * @layer Parser Worker
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

/**
 * Generate canonical, collision-free series keys for OTLP data.
 *
 * This module merges resource and metric attributes, sorts them
 * lexicographically and joins the pairs using constant separators.
 * It is consumed by worker utilities such as otlpMapper and
 * seriesCardinalityCalc to uniquely identify a metric time series
 * within a snapshot.
 */

import type { AttrMap, SeriesKey } from '@/contracts/types';

/** Placeholder string used when an attribute value is null or undefined. */
export const NULL_PLACEHOLDER = '__NULL__';
/** Separator between attribute key/value pairs. */
export const SEP_ATTR = '|';
/** Separator between attribute key and value. */
export const SEP_KV = '=';

/**
 * Encode a metric name and attribute maps into a canonical {@link SeriesKey}.
 *
 * Resource and metric attributes are merged with metric attributes taking
 * precedence on conflicts. Keys are sorted to ensure order-insensitive
 * comparisons. `null` or `undefined` attribute values are replaced with
 * {@link NULL_PLACEHOLDER} so that the resulting key remains stable.
 *
 * @param metricName - Name of the metric as reported by OTLP exporters.
 * @param resourceAttrs - Attributes coming from the resource.
 * @param metricAttrs - Attributes coming from the metric data point.
 * @returns Collision-free series identifier.
 */
export function encodeSeriesKey(
  metricName: string,
  resourceAttrs: AttrMap,
  metricAttrs: AttrMap
): SeriesKey {
  const attrs: Record<string, unknown> = { ...resourceAttrs, ...metricAttrs };
  const keys = Object.keys(attrs).sort();
  const parts = keys.map((k) => {
    const v = (attrs as Record<string, any>)[k];
    const value = v === null || v === undefined ? NULL_PLACEHOLDER : v;
    return `${k}${SEP_KV}${value}`;
  });
  return `${metricName}${SEP_ATTR}${parts.join(SEP_ATTR)}`;
}

/**
 * Decode a {@link SeriesKey} previously produced by {@link encodeSeriesKey}.
 *
 * This helper is intended for debugging and dev-tools. It performs a
 * best-effort parse of the key and attempts to restore primitive types
 * (boolean and numeric values). If the key does not conform to the expected
 * format `null` is returned.
 *
 * The {@link NULL_PLACEHOLDER} token is preserved as a plain string.
 *
 * @param key - Series key string to decode.
 * @returns Metric name and attribute map, or `null` if parsing fails.
 */
export function decodeSeriesKey(
  key: SeriesKey
): { metricName: string; attributes: AttrMap } | null {
  if (!key) return null;

  const parts = key.split(SEP_ATTR);
  if (parts.length === 0) return null;

  const metricName = parts.shift();
  if (metricName === undefined || metricName === '') return null;

  const attributes: Record<string, string | number | boolean> = {};

  for (const kv of parts) {
    const idx = kv.indexOf(SEP_KV);
    if (idx === -1) return null;

    const attrKey = kv.slice(0, idx);
    const rawValue = kv.slice(idx + 1);
    if (!attrKey) return null;

    let value: string | number | boolean;
    if (rawValue === 'true') value = true;
    else if (rawValue === 'false') value = false;
    else if (rawValue !== '' && !Number.isNaN(Number(rawValue))) {
      value = Number(rawValue);
    } else {
      value = rawValue;
    }

    attributes[attrKey] = value;
  }

  return { metricName, attributes };
}

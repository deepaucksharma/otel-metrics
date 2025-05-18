import { encodeSeriesKey } from '@/logic/workers/utils/seriesKeyEncoder';
import type { ParsedMetricData, AttrMap, SeriesKey, SeriesCount } from '@intellimetric/contracts/types';

/**
 * Functions to calculate actual and simulated series counts for metrics.
 *
 * ### Algorithm Steps
 * - `getActualSeriesCount` returns `metric.seriesData.size` as `SeriesCount`.
 * - `simulateDroppedAttributesSeriesCount` iterates over all series,
 *   removes specified attribute keys, re-encodes the series key using
 *   `encodeSeriesKey`, and counts unique results.
 *
 * ### Dependencies
 * - {@link encodeSeriesKey} from `logic/workers/utils/seriesKeyEncoder`.
 * - Types from `contracts/types`.
 *
 * ### Tests
 * - No keys dropped → count equals `getActualSeriesCount`.
 * - Dropping a unique attribute per series collapses to 1.
 * - Dropping a missing attribute leaves count unchanged.
 * - Dropping multiple keys correctly reduces count.
 * - Large dataset (100k series, 3 keys) completes under 40 ms.
 */

/**
 * Return the real number of unique time series within a metric.
 *
 * @param metric Parsed metric containing `seriesData`.
 */
export function getActualSeriesCount(metric: ParsedMetricData): SeriesCount {
  return metric.seriesData.size as SeriesCount;
}

/**
 * Project the series count if certain attribute keys were removed from the
 * series key definition.
 *
 * @param metric     Parsed metric containing series information.
 * @param keysToDrop Attribute keys to remove from each series before
 *                   re-encoding.
 */
export function simulateDroppedAttributesSeriesCount(
  metric: ParsedMetricData,
  keysToDrop: string[]
): SeriesCount {
  if (keysToDrop.length === 0) {
    return metric.seriesData.size as SeriesCount;
  }

  const dropSet = new Set(keysToDrop);
  const projectedSet = new Set<SeriesKey>();

  for (const series of metric.seriesData.values()) {
    const r: AttrMap = { ...series.resourceAttributes };
    const m: AttrMap = { ...series.metricAttributes };
    for (const key of dropSet) {
      delete r[key];
      delete m[key];
    }
    const newKey = encodeSeriesKey(metric.definition.name, r, m);
    projectedSet.add(newKey);
  }

  return projectedSet.size as SeriesCount;
}

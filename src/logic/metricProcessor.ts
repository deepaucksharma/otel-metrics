/**
 * Fa\u00e7ade providing `getProcessedMetricInfo` and related helpers.
 *
 * ### Options
 * - `simulateDropAttributeKey?` - attribute name to drop when calculating projected series count.
 *
 * ### Return Type
 * - `ProcessedMetricInfo` combining the metric definition and cardinality context, or `null` if the metric is absent.
 *
 * ### Cache Strategy
 * - WeakMap keyed by `ParsedMetricData` reference stores the last computed result.
 * - Entry is reused when the same `simulateDropAttributeKey` is requested; otherwise recomputed and replaced.
 *
 * ### Dependencies
 * - `attributeStats.ts` for attribute uniqueness counts.
 * - `seriesCardinalityCalc.ts` for series count calculations.
 * - Types from `contracts/types.ts`.
 *
 * ### Consumers
 * - `hooks/useInspectorProps.ts`
 * - Future dashboard metric list badge.
 *
 * ### Tests
 * - Metric absent returns `null`.
 * - Metric present without simulation uses actual series count.
 * - Dropping a non-existent key leaves count unchanged.
 * - Dropping a key reduces the count below the original.
 * - Repeated call with same metric and options hits the cache.
 */
import type {
  ParsedSnapshot,
  ParsedMetricData,
  ProcessedMetricInfo,
  SeriesCount,
} from '@/contracts/types';
import { calculateAttributeStatsForMetric } from './processing/attributeStats';
import {
  getActualSeriesCount,
  simulateDroppedAttributesSeriesCount,
} from './processing/seriesCardinalityCalc';

export interface ProcessMetricOptions {
  /** Attribute key to drop when simulating cardinality reduction. */
  simulateDropAttributeKey?: string;
}

interface CacheEntry {
  key: string; // empty string when no simulation
  info: ProcessedMetricInfo;
}

const cache = new WeakMap<ParsedMetricData, CacheEntry>();

function findMetric(
  snapshot: ParsedSnapshot,
  metricName: string,
): ParsedMetricData | undefined {
  for (const resource of snapshot.resources) {
    for (const scope of resource.scopes) {
      for (const metric of scope.metrics) {
        if (metric.definition.name === metricName) {
          return metric;
        }
      }
    }
  }
  return undefined;
}

/**
 * Compute cardinality context for a metric within a snapshot.
 *
 * @param snapshot Parsed OTLP snapshot
 * @param metricName Name of the metric to process
 * @param opts Optional processing flags
 * @returns ProcessedMetricInfo or `null` if metric not found
 */
export function getProcessedMetricInfo(
  snapshot: ParsedSnapshot,
  metricName: string,
  opts: ProcessMetricOptions = {},
): ProcessedMetricInfo | null {
  const metric = findMetric(snapshot, metricName);
  if (!metric) return null;

  const key = opts.simulateDropAttributeKey ?? '';
  const cached = cache.get(metric);
  if (cached && cached.key === key) {
    return cached.info;
  }

  const stats = calculateAttributeStatsForMetric(metric);
  const baseCount = getActualSeriesCount(metric);
  let seriesCount: SeriesCount = baseCount;

  if (opts.simulateDropAttributeKey) {
    seriesCount = simulateDroppedAttributesSeriesCount(metric, [
      opts.simulateDropAttributeKey,
    ]);
  }

  const info: ProcessedMetricInfo = {
    definition: metric.definition,
    cardinality: {
      seriesCount,
      baseSeriesCount: baseCount,
      attrUniq: stats.attrUniq,
      attrRank: stats.attrRank,
    },
  };

  cache.set(metric, { key, info });
  return info;
}

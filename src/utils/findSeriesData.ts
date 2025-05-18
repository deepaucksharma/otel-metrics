/**
 * @file src/utils/findSeriesData.ts
 * @summary findSeriesData module
 * @layer 
 * @remarks
 * Layer derived from Architecture-Principles.md.
 */
/**
 * Locate `ParsedSeriesData` by metric name and seriesKey within a snapshot.
 *
 * Public API:
 * ```ts
 * import type { ParsedSnapshot, ParsedSeriesData } from '@/contracts/types';
 *
 * export function findSeriesData(
 *   snapshot: ParsedSnapshot,
 *   metricName: string,
 *   seriesKey: string
 * ): ParsedSeriesData | undefined;
 * ```
 *
 * ### Search Algorithm
 * 1. Iterate over `snapshot.resources`.
 * 2. Within each resource, iterate over its `scopes`.
 * 3. For every scope, find a metric whose `definition.name` matches `metricName`.
 * 4. Look up `seriesKey` in that metric's `seriesData` map.
 * 5. Return the first match, or `undefined` if not found.
 *
 * This is O(number of metrics) with constant-time map lookups.
 *
 * ### Example Usage
 * ```ts
 * const data = findSeriesData(snapshot, 'cpu.usage', mySeriesKey);
 * if (data) {
 *   console.log(data.points[0]);
 * }
 * ```
 *
 * ### Consumers
 * - `useInspectorProps` – builds Inspector props from found series
 * - Dashboards (future) – quick lookup by key for charts
 *
 * ### Tests
 * - ✓ returns series when metric and key exist
 * - ✓ returns undefined for unknown key
 * - ✓ searches across resources and scopes
 */

import type { ParsedSnapshot, ParsedSeriesData } from '@/contracts/types';

export function findSeriesData(
  snapshot: ParsedSnapshot,
  metricName: string,
  seriesKey: string
): ParsedSeriesData | undefined {
  for (const resource of snapshot.resources) {
    for (const scope of resource.scopes) {
      const metric = scope.metrics.find(m => m.definition.name === metricName);
      if (metric) {
        const match = metric.seriesData.get(seriesKey);
        if (match) {
          return match;
        }
      }
    }
  }
  return undefined;
}


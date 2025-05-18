/**
 * Estimate Jaccard similarity between sets of attributes.
 *
 * This module exposes a single function {@link estimateJaccard} used by
 * metric-processing logic to compare attribute maps. The Jaccard index is
 * defined as the size of the intersection divided by the size of the union of
 * two sets. Here, sets are represented as plain objects mapping attribute keys
 * to primitive values.
 */

import type { AttrMap } from '@/contracts/types';

/**
 * Return a number in the inclusive range `[0, 1]` describing how similar
 * `setA` and `setB` are. A result of `1` means every key/value pair matches;
 * `0` means there is no overlap.
 *
 * The function treats each attribute key/value pair as an element of a set and
 * computes:
 *
 * `|intersection(setA, setB)| / |union(setA, setB)|`
 *
 * If both maps are empty, the similarity is defined as `1`.
 *
 * ### Test Scenarios
 * - `{}` vs `{}` → `1`
 * - `{a: 1, b: 2}` vs `{a: 1, b: 2}` → `1`
 * - `{a: 1}` vs `{b: 2}` → `0`
 * - `{a: 1, b: 2}` vs `{a: 1, b: 3}` → `0.5`
 */
export function estimateJaccard(setA: AttrMap, setB: AttrMap): number {
  const unionKeys = new Set<string>([...Object.keys(setA), ...Object.keys(setB)]);
  const unionSize = unionKeys.size;
  if (unionSize === 0) return 1;

  let intersect = 0;
  for (const key of unionKeys) {
    if (
      Object.prototype.hasOwnProperty.call(setA, key) &&
      Object.prototype.hasOwnProperty.call(setB, key) &&
      setA[key] === setB[key]
    ) {
      intersect++;
    }
  }
  return intersect / unionSize;
}


import type { AttrValue, UniqueCount } from '@/contracts/types';

/**
 * Return a Set of unique attribute values.
 *
 * Runs in O(N) time by adding each value to a Set. The Set allocation is kept
 * small and reused by callers only as long as needed.
 *
 * @param values Iterable of attribute values
 */
export function getUniqueValues(values: Iterable<AttrValue>): Set<AttrValue> {
  const set = new Set<AttrValue>();
  for (const v of values) {
    set.add(v);
  }
  return set;
}

/**
 * Count unique attribute values without keeping the Set.
 *
 * This performs the same O(N) traversal as `getUniqueValues` but returns only
 * the resulting size.
 *
 * @param values Iterable of attribute values
 */
export function countUniqueValues(values: Iterable<AttrValue>): UniqueCount {
  return getUniqueValues(values).size as UniqueCount;
}

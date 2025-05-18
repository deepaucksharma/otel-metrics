# findSeriesData.ts – spec
*(Utility nano-module · locate series within a snapshot)*

---

## 1. Purpose

Return the `ParsedSeriesData` for a given metric name and `seriesKey` inside a
`ParsedSnapshot`. Used by hooks and dashboards when they need the raw points
for a specific series.

---

## 2. Public API

```ts
// src/utils/findSeriesData.ts
import type { ParsedSnapshot, ParsedSeriesData } from '@/contracts/types';

/**
 * Locate the series for the given metric and key.
 *
 * @returns the matching ParsedSeriesData or undefined
 */
export function findSeriesData(
  snapshot: ParsedSnapshot,
  metricName: string,
  seriesKey: string
): ParsedSeriesData | undefined;
```

---

## 3. Search Algorithm
1. Iterate over `snapshot.resources`.
2. Within each resource, iterate over its `scopes`.
3. For every scope, find a `ParsedMetricData` whose `definition.name` equals
   `metricName`.
4. Check that metric's `seriesData` map for `seriesKey`.
5. Return the first matching value. If none found after all resources and
   scopes, return `undefined`.

This is O(number of metrics) with constant-time map lookups.

---

## 4. Consumers
| Module / Hook       | Why                                    |
|---------------------|----------------------------------------|
| `useInspectorProps` | Builds Inspector props from found series|
| Dashboards (future) | Quick lookup by key for charts         |

---

## 5. Example Usage
```ts
const data = findSeriesData(snapshot, 'cpu.usage', mySeriesKey);
if (data) {
  console.log(data.points[0]);
}
```

---

## 6. Tests
```
✓ returns series when metric and key exist
✓ returns undefined for unknown key
✓ searches across resources and scopes
```

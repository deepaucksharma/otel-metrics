# useInspectorProps.ts – spec  
*(Hook nano-module · builds Data-Point Inspector props)*

---

## 1. Purpose

Combine **three sources** into a single, memoised `InspectorProps`
object for `DataPointInspectorDrawer`:

1. UI pointers from `uiSlice` (snapshotId, metric, seriesKey, pointId)
2. Parsed data from `metricsSlice`
3. Cardinality context via `getProcessedMetricInfo`

Returns **`null`** until all required pieces are available.

---

## 2. Public API

```ts
// src/hooks/useInspectorProps.ts
import type { InspectorProps } from '@/contracts/types';

/**
 * Resolve the fully-assembled props for the Inspector drawer.
 *
 * @param droppedKey Which attribute key is currently dropped, or null.
 * Returns null if context incomplete or data missing.
 */
export function useInspectorProps(
  droppedKey: string | null
): InspectorProps | null;
```

## 3. Internal Flow

```mermaid
flowchart LR
    uiSliceCtx --> hook
    metricsSlice --> hook
    hook --> metricProcessor
    metricProcessor --> hook
    hook --> InspectorProps
```

Algorithm (simplified):

```ts
const {
  activeSnapshotId,
  inspectedMetricName: metricName,
  inspectedSeriesKey,
  inspectedPointId,
  isInspectorOpen
} = useUiSlice(selector)

if !isInspectorOpen → return null
if !all ids present → return null

snapshot = useSnapshot(activeSnapshotId)
if !snapshot → return null

metricInfo = getProcessedMetricInfo(snapshot, metricName, {
  simulateDropAttributeKey: droppedKey
})

series = snapshot.resources[...] // helper findSeriesByKey
point  = series.points.find(p => p.timestampUnixNano === inspectedPointId)

if !series || !point → return null

return {
  metricName : metricInfo.definition.name,
  seriesKey  : inspectedSeriesKey,
  point,
  resourceAttrs: series.resourceAttributes,
  metricAttrs  : series.metricAttributes,
  metricDefinition: metricInfo.definition,
  cardinality : {
    ...metricInfo.cardinality,
    attrOfPoint : Object.keys(series.metricAttributes).concat(
                    Object.keys(series.resourceAttributes)
                  ),
    thresholdHigh: 2000  // TODO: global config
  },
  exemplars : point.exemplars,
  onClose   : () => uiActions.closeInspector(),
  onAddGlobalFilter: (k,v)=> uiActions.addFilter(k,v), // future
  onSimulateDrop,  // provided by caller
  metricLatestNValues: undefined  // Caller may pass later
}
```

Outputs are stable-reference-memoised via useMemo keyed on the
identifiers; prevents unnecessary Inspector re-renders.

## 4. Dependencies
Hooks: useSnapshot

State slices: uiSlice, metricsSlice

Logic: metricProcessor

Utility: helper findSeriesData(snapshot, metricName, seriesKey)

## 5. Consumers
MetricInstanceWidget – passes return value directly to
<DataPointInspectorDrawer {...props}/>.
The widget also provides the `onSimulateDrop` callback, typically wiring it
to `toggleDrop` from `useDropSimulation`.

## 6. Edge Cases
| Case | Result |
|------|--------|
| Snapshot deleted while open | returns null → parent unmounts Inspector |
| Metric missing (name typo) | null |
| Point timestamp not found | null |

Parent component must hide the drawer if props become null.

## 7. Tests
| Scenario | Expect |
|----------|--------|
| All context set → returns valid props | object with correct metricName |
| Missing seriesKey → returns null | |
| Snapshot removed after open → null | Inspector unmount simulation passes |
| Memoisation: identical inputs → same ref | prev === next |

## 8. Performance
Heavy work (metricProcessor) memoised by snapshot object reference +
metric name; recompute occurs only on simulate-drop or new snapshot load.

End-to-end hook execution ≤ 10 ms for 100 k-series metric.

## 9. Future Plans
Integrate micro-trend sparkline: hook may slice last N points for
the selected series once chart organism added.
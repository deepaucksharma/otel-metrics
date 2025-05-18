# CardinalityCapsule.tsx – spec
*(UI organism · summarises series count and attribute uniqueness)*

---

## 1. Purpose

Display the **current series total** for a metric and list the most significant attributes contributing to its cardinality. Acts as the Inspector's high level "series math" summary.

---

## 2. Public Props

```ts
interface CardinalityCapsuleProps {
  /** Current series count to display. */
  seriesCount: number;
  /** High-cardinality threshold for C-Ring colour. */
  thresholdHigh: number;
  /** Whether the user is simulating a dropped attribute. */
  isDropSimActive: boolean;
  /** Ordered top attributes with unique counts. */
  attrRank: string[];
  attrUniq: Record<string, number>;
}
```

`seriesCount` reflects either the metric's real total or a projected total during simulation.

---

## 3. Series Count Semantics

When `isDropSimActive` is **true**, the parent obtains a projected `seriesCount` via `useInspectorProps` with a `droppedKey`. The hook internally calls `metricProcessor` to calculate `simulateDroppedAttributesSeriesCount`. The returned count is passed down through props.

When `isDropSimActive` is false, `seriesCount` is the actual count from `getActualSeriesCount`.

---

## 4. Display Behaviour

The capsule renders the total beside the C-Ring and mini-bars. When props update—such as toggling drop simulation—the component re-renders showing the new `seriesCount` instantly. No local state is kept; React's prop change alone updates the displayed total.

---

## 5. Consumers

DataPointInspectorDrawer – positioned below the Attribute Zone.

---

## 6. Future

May show percentage change from baseline when multiple attributes can be dropped.

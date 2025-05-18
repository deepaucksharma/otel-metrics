# MetricInstanceWidget.tsx – spec
*(UI Organism · metric view with Inspector integration)*

---

## 1. Purpose

Provide a self-contained widget that renders a single metric from a parsed snapshot and manages the Data-Point Inspector Drawer. It controls attribute drop simulation and exposes the Inspector only when context is complete.

---

## 2. Public Props

```ts
interface MetricInstanceWidgetProps {
  snapshotId: string;
  metricName: string;
}
```

- `snapshotId` — identifier of the `ParsedSnapshot` to read from.
- `metricName` — metric key within that snapshot.

Widget logic derives all further details (series, point, cardinality) from these IDs.

---

## 3. Hook Usage

1. **`useDropSimulation`** returns `[droppedKey, toggleDrop]`. This state represents the attribute currently being dropped for cardinality simulation.
2. **`useInspectorProps`** receives the snapshot id, metric name and `droppedKey` to produce `InspectorProps`. It returns `null` until the selected series and point exist.

```ts
const [droppedKey, toggleDrop] = useDropSimulation();
const inspectorProps = useInspectorProps(droppedKey);
```

---

## 4. Render Structure

```tsx
<div className="metric-widget">
  {/* metric summary / chart elements here */}
  {inspectorProps && (
    <DataPointInspectorDrawer
      {...inspectorProps}
      onSimulateDrop={handleSimulateDrop}
    />
  )}
</div>
```

Child components may include a sparkline or value header above the conditional drawer.

---

## 5. Callback Wiring

`DataPointInspectorDrawer` calls `onSimulateDrop(attributeKey, isDropped)` when the user toggles the "Simulate drop" option. The widget forwards this to `toggleDrop` so the local hook controls which key is simulated:

```ts
function handleSimulateDrop(key: string, drop: boolean) {
  toggleDrop(drop ? key : null);
}
```

Each toggle updates `inspectorProps` via `useInspectorProps`, causing series counts and rarity cues to refresh.

---

## 6. Storybook

Scenarios to include:

1. **Default view** – open widget with valid snapshot and metric.
2. **Drop active** – preselect a dropped attribute to show updated series count.
3. **Inspector closed** – `inspectorProps` returns `null`; drawer hidden.
4. **Multiple widgets** – two instances side-by-side to confirm independent drop state.

Controls allow selecting different metrics and toggling drop keys.

---

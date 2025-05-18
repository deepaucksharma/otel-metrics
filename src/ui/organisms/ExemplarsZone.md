# ExemplarsZone.tsx – spec
*(UI Organism · timeline of exemplar points)*

---

## 1. Purpose

Visualise exemplar data associated with the inspected point. Each
exemplar links metric values to tracing information. The zone shows a
simple timeline and lets the user jump to a trace viewer.

---

## 2. Public Props

```ts
interface ExemplarsZoneProps {
  /** Array of exemplar objects; empty if none */
  exemplars?: ExemplarData[];
  /** Callback when user clicks a trace id */
  onOpenTrace?: (traceId: string) => void;
}
```

## 3. Internal Behaviour

- Returns `null` when `exemplars` is undefined or empty.
- Maps each `ExemplarData` to a dot on a horizontal timeline, ordered by
  `timeUnixNano`.
- Tooltip on hover reveals value and attributes.
- Clicking a dot invokes `onOpenTrace` with the exemplar's `traceId` if
  present.
- Uses a small `<svg>` line for the axis; dot size scales with exemplar
  `value` relative to point max.

Pseudo outline:

```tsx
if (!exemplars?.length) return null;
return (
  <section className={styles.zone}>
    <h4>Exemplars</h4>
    <ExemplarTimeline points={exemplars} onSelect={onOpenTrace}/>
  </section>
);
```

## 4. Role within DataPointInspectorDrawer

Placed below the Attribute Zone and above `RawJsonZone`. The drawer
passes `props.exemplars` and optional trace handler. Absence of data
collapses the zone entirely to avoid empty UI.

## 5. Tests / Storybook
- Storybook: sample exemplar array with trace links.
- RTL: clicking dot fires `onOpenTrace`.

## 6. Performance
Renders at most tens of SVG elements; inexpensive even with 100
exemplars.

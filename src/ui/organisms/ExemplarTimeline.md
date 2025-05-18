# ExemplarTimeline.tsx – spec
*(UI Organism · visual timeline of exemplar events)*

---

## 1. Purpose

Display a row of dots representing **exemplar data points** related to a
selected metric point. Each dot links the numeric value of the exemplar
with its trace context so users can quickly jump to a trace viewer.

---

## 2. Public Props

```ts
interface ExemplarTimelineProps {
  /** Array of exemplar objects to render */
  exemplars: ExemplarData[];
}
```

---

## 3. Rendering Approach

* Exemplars are ordered by `timeUnixNano` and spaced evenly along a
  horizontal line (relative order, not scaled by time).
* Each exemplar renders as a **circular dot**. Radius is proportional to
  its `value` compared with the range of values in the array.
* `title` attribute displays the exemplar `traceId` (and value) so the
  browser shows a tooltip on hover.
* Dots can be clicked to open the trace in a new tab when the app has
  a trace viewer URL template (future enhancement).

Implementation sketch:

```tsx
exemplars.sort((a,b) => a.timeUnixNano - b.timeUnixNano);
const values = exemplars.map(e => e.value);
const min = Math.min(...values);
const max = Math.max(...values);
return (
  <ul className="timeline">
    {exemplars.map(e => (
      <li
        key={e.timeUnixNano}
        style={{
          width: `${100 / exemplars.length}%`,
        }}
      >
        <span
          className="dot"
          style={{
            width: scale(e.value, min, max),
            height: scale(e.value, min, max)
          }}
          title={e.traceId ?? 'no trace'}
        />
      </li>
    ))}
  </ul>
);
```

Dot size mapping handled by a small `scale()` helper that clamps to a
4–12 px range.

---

## 4. Integration Inside `ExemplarsZone`

`ExemplarsZone` is a section of the Data‑Point Inspector drawer. It reads
`point.exemplars` from the Inspector props and passes them directly to
`<ExemplarTimeline exemplars={point.exemplars} />`. When the array is
empty the zone renders a small "No exemplars" hint instead of the
timeline.

---

## 5. Storybook Scenarios

1. **Empty timeline** – `exemplars: []` → shows "No exemplars" state.
2. **Populated timeline** – array of 3–5 exemplars with different values
   and traceIds. Demonstrates dot sizing and tooltip text.

Each story allows adjusting exemplar values to verify the size scaling.

---

## 6. Accessibility

Dots include `aria-label` mirroring the tooltip text so screen readers
announce the exemplar value and traceId. The timeline `<ul>` has
`role="list"` for semantics.


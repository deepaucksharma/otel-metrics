# DataPointInspectorDrawer.tsx – spec
*(UI Layout · 660px slide-in detail panel)*

---

## 1. Purpose

Provides a **focused drill‑down view** for a single metric data point. The drawer
slides in from the right and aggregates several organisms:
`InspectorHeader`, `AttributeZone`, `CardinalityCapsule`, and supporting atoms.
It surfaces series cardinality insights and exemplar information while allowing
simulated attribute drops.

---

## 2. Public Props

```ts
import type { InspectorProps } from '@/contracts/types';

/** Prop contract defined in contracts/types.ts */
export interface DataPointInspectorDrawerProps extends InspectorProps {}
```

Key callbacks:

- `onClose()` – close the drawer.
- `onAddGlobalFilter(key, value)` – optional add-filter action.
- `onSimulateDrop(attributeKey, isDropped)` – toggle attribute drop simulation.

All other fields mirror the InspectorProps structure (metricName, point,
attributes, cardinality context, etc.).

---

## 3. Layout Outline

```tsx
<aside className="drawer">
  <InspectorHeader
    metricName={metricName}
    metricDefinition={metricDefinition}
    cardinality={cardinality}
    onClose={onClose}
  />
  <main className="zones">
    <CardinalityCapsule
      seriesCount={cardinality.seriesCount}
      attrRank={cardinality.attrRank}
      attrUniq={cardinality.attrUniq}
      thresholdHigh={cardinality.thresholdHigh}
      onSimulateDrop={onSimulateDrop}
    />
    <AttributeZone
      resourceAttrs={resourceAttrs}
      metricAttrs={metricAttrs}
      focusedKey={focusedKey}
      onFocusKey={setFocusedKey}
      onSimulateDrop={onSimulateDrop}
      onAddGlobalFilter={onAddGlobalFilter}
    />
    {/* ValueZone & ExemplarsZone omitted for brevity */}
  </main>
</aside>
```

Focus state is managed locally so arrow‑key navigation can highlight different
`AttributeRow` entries. Pressing **Esc** triggers `onClose()`.

---

## 4. Dependencies
- `InspectorHeader` layout
- `AttributeZone` organism (uses `AttributeRow` molecule)
- `CardinalityCapsule` organism (`MiniBar`, `RarityDot`, `SeriesMathChip`)
- `CRingSvg` atom for series-count indicator
- Global design tokens and CSS modules

---

## 5. Consumers
- `MetricInstanceWidget` renders this drawer when a point is selected
- Future dashboard components may open the drawer for quick inspection

---

## 6. Tests / Storybook
- RTL: drawer opens/closes via `onClose` callback
- Storybook variant with mock `InspectorProps`
- Keyboard focus cycle across zones; Esc key closes

---

## 7. Performance
All props are precomputed; render ≤ 20 ms.
No internal data fetching. CSS transitions used only for the slide‑in effect.

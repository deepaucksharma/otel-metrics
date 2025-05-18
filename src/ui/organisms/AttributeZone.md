# AttributeZone.tsx – spec
*(UI Organism · attribute list with rarity & actions)*

---

## 1. Purpose

Display all **resource** and **metric** attributes for the selected series.
Each row shows the key, value, rarity indicator and optional action buttons.
Supports focus navigation and "simulate drop" toggling.

---

## 2. Public Props

```ts
interface AttributeZoneProps {
  resourceAttrs: Record<string, AttrValue>;
  metricAttrs:   Record<string, AttrValue>;
  focusedKey?:   string | null;
  onFocusKey?:   (key: string | null) => void;
  onSimulateDrop?: (key: string, drop: boolean) => void;
  onAddGlobalFilter?: (key: string, value: AttrValue) => void;
}
```

`focusedKey` indicates which attribute row is currently highlighted.

---

## 3. Implementation Outline

```tsx
<section className="attrZone">
  {Object.entries(resourceAttrs).map(([k,v]) => (
    <AttributeRow
      key={"r-"+k}
      attrKey={k}
      value={v}
      rarityPercent={rarityCalc(k,v)}
      focused={focusedKey === k}
      onFocus={() => onFocusKey?.(k)}
      onSimulateDrop={onSimulateDrop}
      onAddGlobalFilter={onAddGlobalFilter}
    />
  ))}
  {Object.entries(metricAttrs).map(([k,v]) => (
    <AttributeRow ... />
  ))}
</section>
```

`rarityCalc` data is supplied via props in the real component (precomputed in
`metricProcessor`). When a row's checkbox is toggled, it calls
`onSimulateDrop(k, checked)` which bubbles up to the drawer via callbacks.

Arrow keys update focus through `onFocusKey`. Enter triggers the row's copy or
filter action via `AttributeRow`.

---

## 4. Dependencies
- `AttributeRow` molecule (renders individual lines)
- `RarityDot`, `CopyButton` atoms inside each row
- React focus management helpers

---

## 5. Consumers
- Used by `DataPointInspectorDrawer`
- Could be embedded in future "series card" widgets

---

## 6. Tests / Storybook
- Storybook: sample attribute maps with focus/hover simulation
- RTL: verifies callback order when toggling simulate drop
- Focus loop tests using arrow-key events

---

## 7. Performance
Lists are small (< 20 rows). Rendering cost dominated by `AttributeRow` atoms.
Focus state stored locally to avoid re-render of parent drawer.

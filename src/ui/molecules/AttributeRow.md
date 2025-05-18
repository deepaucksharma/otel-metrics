# AttributeRow.tsx – spec
*(UI Molecule · attribute display row with actions)*

---

## 1. Purpose

Render a single key/value pair inside the Attribute Zone of
`DataPointInspectorDrawer`. Each row conveys how common the attribute
value is, allows quick copy of the pair and supports "simulate drop"
interaction for cardinality what‑if analysis.

---

## 2. Public Props

```ts
interface AttributeRowProps {
  /** Attribute key */
  attrKey: string;
  /** Primitive value of the attribute */
  attrValue: AttrValue;
  /** Percentage of series containing this value */
  rarityPercent: number;
  /** Whether the row is currently focused/highlighted */
  isFocused?: boolean;
  /** Callback to toggle drop simulation */
  onSimulateDrop?: (key: string, drop: boolean) => void;
  /** Add key=value as a global filter */
  onAddGlobalFilter?: (key: string, value: AttrValue) => void;
}
```

## 3. Internal Behaviour

- Renders `attrKey` and `attrValue` text along with a `RarityDot` atom
  coloured by `rarityPercent`.
- Includes a `CopyButton` atom that copies `"key=value"` to clipboard.
- Clicking the row toggles focus; when focused, an inline checkbox
  appears to enable/disable drop simulation via `onSimulateDrop`.
- Optional filter icon calls `onAddGlobalFilter` when provided.
- `isFocused` controls a highlight style and keyboard focus ring.

Pseudo layout:

```tsx
<div className={rowClass}>
  <RarityDot rarityPercent={rarityPercent}/>
  <span className={styles.key}>{attrKey}</span>
  <span className={styles.value}>{String(attrValue)}</span>
  {isFocused && (
    <label><input type="checkbox" onChange={...}/> drop</label>
  )}
  <CopyButton copyValue={`${attrKey}=${attrValue}`}/>
</div>
```

## 4. Role within DataPointInspectorDrawer

`DataPointInspectorDrawer` maps over `metricAttrs` and `resourceAttrs`
from `InspectorProps` to render an `AttributeRow` for each entry. The
molecule encapsulates all per-row interaction so the drawer only passes
callbacks and rarity data.

## 5. Tests / Storybook
- Storybook: common vs rare values, focused state.
- Jest/RTL: copy button fires, simulate drop callback toggles.

## 6. Performance
Minimal render cost; only re-renders when props change or focus toggles.

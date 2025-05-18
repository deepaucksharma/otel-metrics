# SeriesMathChip.tsx – spec
*(UI Atom · displays series-count formula)*

---

## 1. Purpose

Visualise the **series cardinality formula** in compact form. Example:
`attrA × attrB × attrC = 4200`. Used in the Inspector header and capsule to
reinforce how attribute uniqueness multiplies.

---

## 2. Public Props

```ts
interface SeriesMathChipProps {
  seriesCount: SeriesCount;
  thresholdHigh: SeriesCount;
}
```

The chip derives colour from the ratio `seriesCount / thresholdHigh`.

---

## 3. Render Contract

```tsx
<span className={clsx(styles.chip, utilisationClass)}>
  {formulaText(seriesCount)}
</span>
```

`utilisationClass` maps to green/amber/red tokens (same thresholds as `CRingSvg`).
`formulaText` turns attribute factors into a string (precomputed by parent
`CardinalityCapsule`).

---

## 4. Dependencies
- design tokens for colour ramp
- CSS module for rounded chip styling

---

## 5. Consumers
- `InspectorHeader`
- `CardinalityCapsule` summary list

---

## 6. Tests / Storybook
- Storybook controls for `seriesCount` and `thresholdHigh`
- Snapshot: colour class changes at 60 % and 85 % utilisation

---

## 7. Performance
Pure text span; no re-renders except when counts change.

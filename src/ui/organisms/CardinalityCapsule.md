# CardinalityCapsule.tsx – spec
*(UI Organism · summary of series math & attribute shares)*

---

## 1. Purpose

Provide a concise overview of metric series count and how each attribute
contributes to it. Shows a `SeriesMathChip` plus top-N attribute
`MiniBar` visualisations with `RarityDot` hints. Allows toggling simulation of
dropped attributes.

---

## 2. Public Props

```ts
interface CardinalityCapsuleProps {
  seriesCount: SeriesCount;
  attrUniq: Record<string, UniqueCount>;
  attrRank: string[];
  thresholdHigh: SeriesCount;
  onSimulateDrop?: (key: string, drop: boolean) => void;
}
```

Only the top 5 ranked attributes are displayed by default.

---

## 3. Implementation Outline

```tsx
<section className="capsule">
  <SeriesMathChip
    seriesCount={seriesCount}
    thresholdHigh={thresholdHigh}
  />
  {attrRank.slice(0,5).map(key => (
    <div key={key} className="attrRow">
      <span className="key">{key}</span>
      <MiniBar
        percent={attrUniq[key] / seriesCount * 100}
        label={`${attrUniq[key]}`}
      />
      <RarityDot rarityPercent={attrUniq[key] / seriesCount * 100}/>
      <input
        type="checkbox"
        onChange={e => onSimulateDrop?.(key, e.target.checked)}
      />
    </div>
  ))}
</section>
```

When a checkbox is changed the component calls `onSimulateDrop` with the
attribute key and desired state. Parent components recalc series counts and pass
back updated props.

---

## 4. Dependencies
- `SeriesMathChip`
- `MiniBar`
- `RarityDot`

---

## 5. Consumers
- `DataPointInspectorDrawer` header zone
- Potential metric summary cards

---

## 6. Tests / Storybook
- Storybook: knob for seriesCount and simulated drop state
- RTL: verifies `onSimulateDrop` payload and order
- Snapshot: top-N list renders sorted by `attrRank`

---

## 7. Performance
Top-N slice keeps render cheap (<6 rows). Only rerenders when parent
series count or simulation state changes.

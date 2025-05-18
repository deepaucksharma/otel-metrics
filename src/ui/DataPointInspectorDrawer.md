# DataPointInspectorDrawer.tsx \u2013 spec
*(UI Layout \xb7 detailed metric point exploration drawer)*

---

## 1. Purpose

Provide a slide-in panel that lets engineers inspect a single OTLP metric data point in depth. The drawer visualises point values, attributes and exemplar information while offering tools to simulate attribute dropping and highlight cardinality impact.

---

## 2. Public Props

```ts
interface DataPointInspectorDrawerProps {
  /** Metric name + instrument type */
  metric: MetricMeta;
  /** Series key uniquely identifying the data point */
  seriesKey: SeriesKey;
  /** Full attribute map for the point */
  attributes: Record<string, string>;
  /** Exemplars belonging to this point */
  exemplars?: Exemplar[];
  /** Total series count for the metric */
  seriesCount: number;
  /** Threshold where high cardinality warnings trigger */
  thresholdHigh: number;
  /** Callback when drawer is closed */
  onClose: () => void;
}
```

## 3. Layout Zones

1. **Header** \u2013 metric context and close button
2. **Value Zone** \u2013 renders latest value(s) with sparkline
3. **Attribute Zone** \u2013 list showing rarity dots and copy buttons
4. **Cardinality Capsule** \u2013 CRing + MiniBars summarising series spread
5. **Exemplars Zone** \u2013 optional, collapsible if no exemplars
6. **Raw JSON Zone** \u2013 collapsible area to view full payload

## 4. Behaviour Sketch

```tsx
export const DataPointInspectorDrawer: React.FC<DataPointInspectorDrawerProps> = ({
  metric, seriesKey, attributes, exemplars, seriesCount, thresholdHigh, onClose
}) => {
  const [focusedAttr, setFocusedAttr] = useState<string|null>(null);
  const [showRaw, setShowRaw] = useState(false);
  const [dropSim, setDropSim] = useState(false);

  return (
    <aside className="drawer">
      {/* Header + close */}
      {/* ValueZone */}
      {/* AttributeZone */}
      {/* CardinalityCapsule */}
      {/* ExemplarsZone */}
      {/* RawJsonZone */}
    </aside>
  );
};
```

CSS modules scope all styles. Drawer is positioned fixed right with width 660px.

## 5. Accessibility

Focus is trapped inside while open. ARIA labels on interactive zones. Drawer close announced via `aria-live` region.

## 6. Consumers

Triggered from MetricInstanceWidget when a point is clicked. Receives props via `useInspectorProps` hook.

## 7. Tests / Storybook

Story states:
- **Closed vs Open** \u2013 ensure focus trap and esc-close
- **Attribute Focused** \u2013 list scrolls to selected attribute
- **Drop Simulation Active** \u2013 rarity recalculated with checkboxes
- **Raw JSON Expanded** \u2013 collapsible area toggled

Jest RTL verifies close button fires onClose and focus trap behaviour.

## 8. Performance

Initial mount <20 ms. Attribute list memoised. No network calls in component.

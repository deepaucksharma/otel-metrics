# ValueZone.tsx – spec
*(UI Organism · Inspector numeric value display)*

---

## 1. Purpose

Render the **value visualisation area** inside the Data-Point Inspector.
Depending on the metric type it shows either a gauge, counter or histogram
summary for the selected data point.

---

## 2. Public Props

```ts
interface ValueZoneProps {
  /** Data point being inspected. */
  point: ParsedPoint;
  /** Metric metadata used to decide display style. */
  metricDefinition: MetricDefinition;
}
```

---

## 3. Render Logic

```tsx
switch (metricDefinition.instrumentType) {
  case 'Gauge':
  case 'Sum' when !metricDefinition.isMonotonic:
    return <GaugeCard value={point.value} unit={metricDefinition.unit} />;
  case 'Sum':
    return <CounterCard value={point.value} unit={metricDefinition.unit} />;
  case 'Histogram':
    return <HistogramMiniChart buckets={point.bucketCounts}
                               bounds={point.explicitBounds} />;
  default:
    return null;
}
```

- **GaugeCard** – radial dial for gauge/up-down counter values.
- **CounterCard** – big integer badge for cumulative counters.
- **HistogramMiniChart** – tiny distribution chart using bucket counts.

---

## 4. Numeric Formatting

Both GaugeCard and CounterCard format numeric values with
`fmtInt()` from [formatters.md](../formatters.md) so large counts show
thousand separators.

---

## 5. Storybook

Stories demonstrate each metric type:

1. **Gauge** – `instrumentType: 'Gauge'` with sample value.
2. **Counter** – monotonic `Sum` showing increasing total.
3. **Histogram** – renders HistogramMiniChart with mock buckets.

Dark/light theme toggles to verify contrast.

---

## 6. Consumers

Used inside `DataPointInspectorDrawer` right beneath the header section.

---

## 7. Future Enhancements

Support for `Summary` metrics once parsing implemented.

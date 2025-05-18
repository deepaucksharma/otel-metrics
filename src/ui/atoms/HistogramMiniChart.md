# HistogramMiniChart.tsx – spec
*(UI Atom · compact histogram visualization)*

---

## 1. Purpose

Display a **compact visualization of histogram data** from OTLP histogram metrics. The component renders bucket distributions in a minimal, easy-to-scan format that shows the overall shape of the data without requiring a large amount of screen space.

---

## 2. Public Props

```ts
interface HistogramMiniChartProps {
  /** Bucket counts from histogram metric */
  buckets: number[];
  
  /** Bucket boundaries from histogram metric */
  bounds: number[];
  
  /** Optional unit for values */
  unit?: string;
  
  /** Height of the chart in pixels (default: 60) */
  height?: number;
  
  /** Optional className for container */
  className?: string;
}
```

## 3. Visual Appearance

```
┌───────────────────────────────────────────────────┐
│                                                   │
│                                          ▐        │
│                                      ▐   ▐        │
│                                  ▐   ▐   ▐        │
│                      ▐       ▐   ▐   ▐   ▐        │
│                  ▐   ▐   ▐   ▐   ▐   ▐   ▐   ▐    │
│ ▐   ▐   ▐   ▐   ▐   ▐   ▐   ▐   ▐   ▐   ▐   ▐    │
├───────────────────────────────────────────────────┤
│ 0ms         100ms        200ms        300ms  inf  │
└───────────────────────────────────────────────────┘
```

## 4. Implementation

```tsx
import React, { useMemo } from 'react';
import styles from './HistogramMiniChart.module.css';
import { formatDuration } from '@/utils/formatters';

export const HistogramMiniChart: React.FC<HistogramMiniChartProps> = ({
  buckets,
  bounds,
  unit = 'ms',
  height = 60,
  className,
}) => {
  // Calculate maximum bucket count for scaling
  const maxCount = useMemo(() => {
    return Math.max(...buckets);
  }, [buckets]);
  
  // Calculate bar heights as percentages of maximum
  const barHeights = useMemo(() => {
    return buckets.map(count => (count / maxCount) * 100);
  }, [buckets, maxCount]);
  
  // Format bounds for axis labels
  const boundLabels = useMemo(() => {
    // Add "inf" for the last bucket (which has no upper bound)
    const labels = bounds.map(bound => formatDuration(bound, unit));
    labels.push('inf');
    return labels;
  }, [bounds, unit]);
  
  return (
    <div className={`${styles.container} ${className || ''}`} style={{ height: `${height + 40}px` }}>
      <div className={styles.chartArea} style={{ height: `${height}px` }}>
        {barHeights.map((barHeight, index) => (
          <div 
            key={index}
            className={styles.bar}
            style={{ 
              height: `${barHeight}%`,
              width: `${100 / (buckets.length)}%`
            }}
            title={`${buckets[index]} items in ${boundLabels[index]} - ${boundLabels[index + 1]} range`}
          />
        ))}
      </div>
      
      <div className={styles.axisLabels}>
        {boundLabels.map((label, index) => (
          <div 
            key={index} 
            className={styles.axisLabel}
            style={{ 
              left: `${(index / boundLabels.length) * 100}%`,
              transform: 'translateX(-50%)'
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};
```

## 5. CSS & Styling

```css
.container {
  display: flex;
  flex-direction: column;
  width: 100%;
  padding: 8px;
  background-color: var(--cardBg);
  border-radius: 6px;
}

.chartArea {
  display: flex;
  align-items: flex-end;
  width: 100%;
  border-bottom: 1px solid var(--axisBorderColor);
}

.bar {
  background-color: var(--histogramBarColor);
  margin: 0 1px;
  min-height: 1px;
}

.axisLabels {
  position: relative;
  height: 20px;
  margin-top: 4px;
  width: 100%;
}

.axisLabel {
  position: absolute;
  font-size: 11px;
  color: var(--axisLabelColor);
  white-space: nowrap;
}
```

## 6. Design Tokens

```css
:root {
  --histogramBarColor: #3498db;
  --axisBorderColor: rgba(255, 255, 255, 0.2);
  --axisLabelColor: rgba(255, 255, 255, 0.7);
  --cardBg: rgba(0, 0, 0, 0.05);
}
```

## 7. Consumers

ValueZone – renders this component for histogram metrics.

## 8. Feature: Bucket Highlighting

```ts
interface HistogramMiniChartProps {
  // ... other props
  
  /** Optional bucket index to highlight */
  highlightBucket?: number;
}
```

```css
.barHighlighted {
  background-color: var(--histogramHighlightColor);
}
```

## 9. Feature: Value Line Overlay

```ts
interface HistogramMiniChartProps {
  // ... other props
  
  /** Optional value to overlay as reference line */
  referenceValue?: number;
}
```

```jsx
{referenceValue && (
  <div 
    className={styles.referenceLine}
    style={{ 
      left: `${getPositionForValue(referenceValue, bounds)}%` 
    }}
  />
)}
```

```css
.referenceLine {
  position: absolute;
  height: 100%;
  width: 2px;
  background-color: var(--referenceLineColor);
  z-index: 1;
}
```

## 10. Tests

| Scenario | Expected |
|----------|----------|
| Basic render | Shows bars proportional to counts |
| Empty buckets | Renders with zero-height bars |
| Single bucket | Shows one bar at full height |
| With unit | Formatted bounds with unit |
| Different heights | Renders at specified height |
| Bucket highlighting | Highlights specified bucket |
| Reference value | Shows line at correct position |

## 11. Accessibility

- Title attributes on bars for screen reader information
- Color choices maintain sufficient contrast
- Visual pattern distinguishable without relying solely on color
- Adequate text size for axis labels

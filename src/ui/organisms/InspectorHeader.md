# InspectorHeader.tsx – spec  
*(UI Organism · header bar for DataPointInspectorDrawer)*

---

## 1. Purpose

Render a **fixed header** for the DataPointInspectorDrawer that displays:

* Metric name and description with proper truncation/tooltips
* Visual instrument type indicator (gauge, counter, histogram) 
* Cardinality ring visualization (C-Ring)
* Close button

The header remains visible even when scrolling through drawer content.

---

## 2. Public Props

```ts
// src/ui/organisms/InspectorHeader.tsx
import type { MetricDefinition, SeriesCount } from '@/contracts/types';

export interface InspectorHeaderProps {
  /** Metric schema definition */
  metricDefinition: MetricDefinition;
  
  /** Current series count for the metric */
  seriesCount: SeriesCount;
  
  /** Threshold where cardinality is considered high */
  thresholdHigh: SeriesCount;
  
  /** Close drawer callback */
  onClose: () => void;
}
```

## 3. Visual Structure

```
┌─────────────────────────────────────────────────────────────┐
│ ⟳ http.server.duration                               [✕]    │
│ Duration of HTTP server requests (in milliseconds)           │
└─────────────────────────────────────────────────────────────┘
```

Where `⟳` is the InstrumentBadge (in this case, a Histogram) with CRingSvg surrounding it.

## 4. Component Implementation

```tsx
import React from 'react';
import styles from './InspectorHeader.module.css';
import { CRingSvg } from '@/ui/atoms/CRingSvg';
import { InstrumentBadge } from '@/ui/atoms/InstrumentBadge';

export const InspectorHeader: React.FC<InspectorHeaderProps> = ({
  metricDefinition,
  seriesCount,
  thresholdHigh,
  onClose,
}) => {
  const { name, description, instrumentType, unit } = metricDefinition;
  
  return (
    <div className={styles.header}>
      <div className={styles.badgeContainer}>
        <CRingSvg 
          seriesCount={seriesCount}
          thresholdHigh={thresholdHigh}
          diameter={32}
          strokeWidth={3}
          animated={true}
        />
        <InstrumentBadge 
          type={instrumentType} 
          className={styles.badge}
        />
      </div>
      
      <div className={styles.textContainer}>
        <h2 className={styles.title} title={name}>
          {name}
          {unit && <span className={styles.unit}> ({unit})</span>}
        </h2>
        
        {description && (
          <p className={styles.description} title={description}>
            {description}
          </p>
        )}
      </div>
      
      <button 
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close inspector"
      >
        ×
      </button>
    </div>
  );
};
```

## 5. CSS & Styling

```css
.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
  background-color: var(--headerBg);
  border-bottom: 1px solid var(--borderColor);
  min-height: 64px;
  position: sticky;
  top: 0;
  z-index: 2;
}

.badgeContainer {
  position: relative;
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge {
  z-index: 1; /* ensures badge is above CRingSvg */
}

.textContainer {
  flex: 1;
  min-width: 0; /* enables text truncation */
  overflow: hidden;
}

.title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--headerTextColor);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unit {
  font-weight: normal;
  opacity: 0.7;
  font-size: 14px;
}

.description {
  margin: 4px 0 0 0;
  font-size: 13px;
  color: var(--descriptionColor);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 540px;
}

.closeButton {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--closeButtonColor);
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-left: 8px;
  transition: background-color 0.2s;
}

.closeButton:hover, .closeButton:focus {
  background-color: var(--closeButtonHoverBg);
  color: var(--closeButtonHoverColor);
}
```

## 6. Design Tokens

```css
:root {
  --headerBg: #1e1e1e;
  --headerTextColor: #ffffff;
  --descriptionColor: #b0b0b0;
  --borderColor: #333333;
  --closeButtonColor: #888888;
  --closeButtonHoverBg: rgba(255, 255, 255, 0.1);
  --closeButtonHoverColor: #ffffff;
}
```

## 7. Integration with Child Components

### CRingSvg 

The CRingSvg is positioned absolutely around the InstrumentBadge to create a concentric visualization:

- `seriesCount` passes the current series count 
- `thresholdHigh` passes the threshold for high cardinality
- Visually indicates cardinality load with color changes (green → amber → red)

### InstrumentBadge

The InstrumentBadge shows appropriate icon based on `instrumentType`:

- Gauge: Circular gauge icon
- Sum: Stacked counter icon 
- Histogram: Distribution icon
- Summary: Percentile chart icon
- Unknown: Question mark

## 8. Consumers

DataPointInspectorDrawer – renders this component at the top of the drawer.

## 9. Tests

| Scenario | Expected |
|----------|----------|
| Render with all props | Header shows name, description and close button |
| Click close button | onClose callback called |
| Long text overflows | Text truncates with ellipsis, tooltip available |
| Missing description | Description line not rendered |
| Different instrument types | Correct badge icon rendered |
| Cardinality above threshold | CRingSvg shows red color |

## 10. Accessibility

- Close button has aria-label
- Text contrast meets WCAG AA (4.5:1 for normal text, 3:1 for large text)
- Tooltips for truncated text
- Keyboard focus styles for close button

## 11. Performance

The header is set with `position: sticky` to improve scrolling performance by avoiding re-layout calculations when scrolling through the drawer's content.
# ExemplarsZone.tsx – spec  
*(UI Organism · exemplar timeline visualization)*

---

## 1. Purpose

Render a **timeline visualization of exemplars** associated with a metric data point. 
Exemplars are trace sample points that were captured alongside the metric value,
providing:

* Links between metrics and traces
* Context for specific observations
* Temporal distribution of events
* Additional attribute context

This component helps users understand when and with what context trace events occurred.

---

## 2. Public Props

```ts
// src/ui/organisms/ExemplarsZone.tsx
import { ExemplarData } from '@/contracts/types';

export interface ExemplarsZoneProps {
  /** Array of exemplar data objects */
  exemplars: ExemplarData[];
  
  /** Optional callback when exemplar is clicked */
  onExemplarClick?: (exemplar: ExemplarData) => void;
}
```

## 3. Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│ EXEMPLARS (5)                                           │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ●         ●●          ●                     ●          │
│  └─────────┴───────────┴─────────────────────┘          │
│ 12:01:01  12:01:10    12:01:15             12:01:30     │
│                                                         │
│ Selected: 12:01:15.245 - value: 245.8ms                 │
│ Trace ID: 84fd632... [View Trace]                       │
│                                                         │
│ ATTRIBUTES:                                             │
│ status_code: 200                                        │
│ http.url: /api/v1/metrics                               │
└─────────────────────────────────────────────────────────┘
```

## 4. Component Implementation

```tsx
import React, { useState, useMemo } from 'react';
import styles from './ExemplarsZone.module.css';
import { formatTimestamp, formatDuration } from '@/utils/formatters';
import { CopyButton } from '@/ui/atoms/CopyButton';

export const ExemplarsZone: React.FC<ExemplarsZoneProps> = ({
  exemplars,
  onExemplarClick
}) => {
  const [selectedExemplar, setSelectedExemplar] = useState<ExemplarData | null>(null);
  
  // Sort exemplars by timestamp
  const sortedExemplars = useMemo(() => {
    return [...exemplars].sort((a, b) => a.timeUnixNano - b.timeUnixNano);
  }, [exemplars]);
  
  // Calculate timeline range
  const timeRange = useMemo(() => {
    if (sortedExemplars.length < 2) return null;
    
    const minTime = sortedExemplars[0].timeUnixNano;
    const maxTime = sortedExemplars[sortedExemplars.length - 1].timeUnixNano;
    return { minTime, maxTime, span: maxTime - minTime };
  }, [sortedExemplars]);
  
  const handleExemplarSelect = (exemplar: ExemplarData) => {
    setSelectedExemplar(exemplar);
    
    if (onExemplarClick) {
      onExemplarClick(exemplar);
    }
  };
  
  // Calculate position on timeline (percentage)
  const getPositionPercent = (timestamp: number) => {
    if (!timeRange || timeRange.span === 0) return 0;
    return ((timestamp - timeRange.minTime) / timeRange.span) * 100;
  };
  
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>EXEMPLARS ({exemplars.length})</h3>
      
      {exemplars.length > 0 && timeRange && (
        <div className={styles.timeline}>
          <div className={styles.dots}>
            {sortedExemplars.map((exemplar, index) => {
              const position = getPositionPercent(exemplar.timeUnixNano);
              const isSelected = selectedExemplar === exemplar;
              
              return (
                <div 
                  key={`${exemplar.timeUnixNano}-${index}`}
                  className={`${styles.dot} ${isSelected ? styles.selected : ''}`}
                  style={{ left: `${position}%` }}
                  onClick={() => handleExemplarSelect(exemplar)}
                  title={`Value: ${exemplar.value}, Time: ${formatTimestamp(exemplar.timeUnixNano)}`}
                />
              );
            })}
          </div>
          
          <div className={styles.axis}>
            <div className={styles.line} />
            <div className={styles.tickMarks}>
              {[0, 25, 50, 75, 100].map(position => (
                <div 
                  key={position}
                  className={styles.tick}
                  style={{ left: `${position}%` }}
                >
                  <span className={styles.tickLabel}>
                    {formatTimestamp(timeRange.minTime + (timeRange.span * (position / 100)))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {selectedExemplar && (
        <div className={styles.details}>
          <div className={styles.header}>
            <div className={styles.timestamp}>
              {formatTimestamp(selectedExemplar.timeUnixNano, true)}
            </div>
            <div className={styles.value}>
              value: {formatDuration(selectedExemplar.value)}
            </div>
          </div>
          
          {selectedExemplar.traceId && (
            <div className={styles.traceInfo}>
              <div className={styles.traceId}>
                Trace ID: {selectedExemplar.traceId.substring(0, 10)}...
                <CopyButton 
                  value={selectedExemplar.traceId} 
                  label="Copy trace ID"
                />
              </div>
              
              {selectedExemplar.spanId && (
                <div className={styles.spanId}>
                  Span ID: {selectedExemplar.spanId}
                  <CopyButton 
                    value={selectedExemplar.spanId} 
                    label="Copy span ID"
                  />
                </div>
              )}
              
              {onExemplarClick && (
                <button 
                  className={styles.viewTraceButton}
                  onClick={() => onExemplarClick(selectedExemplar)}
                  aria-label="View trace details"
                >
                  View Trace
                </button>
              )}
            </div>
          )}
          
          {Object.keys(selectedExemplar.attributes).length > 0 && (
            <div className={styles.attributes}>
              <h4 className={styles.attributesTitle}>ATTRIBUTES:</h4>
              <div className={styles.attributesList}>
                {Object.entries(selectedExemplar.attributes).map(([key, value]) => (
                  <div key={key} className={styles.attributeRow}>
                    <span className={styles.attributeKey}>{key}:</span>
                    <span className={styles.attributeValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      
      {exemplars.length === 0 && (
        <div className={styles.empty}>
          No exemplars available for this data point.
        </div>
      )}
    </div>
  );
};
```

## 5. CSS & Styling

```css
.container {
  padding: 16px;
  background-color: var(--cardBg);
  border-radius: 6px;
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0 0 12px 0;
}

.timeline {
  height: 80px;
  position: relative;
  margin: 24px 0;
}

.dots {
  position: relative;
  height: 40px;
}

.dot {
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: var(--dotColor);
  transform: translate(-50%, 0);
  top: 20px;
  cursor: pointer;
  transition: transform 0.2s, background-color 0.2s;
}

.dot:hover {
  transform: translate(-50%, 0) scale(1.2);
  background-color: var(--dotHoverColor);
}

.dot.selected {
  background-color: var(--dotSelectedColor);
  transform: translate(-50%, 0) scale(1.5);
}

.axis {
  position: relative;
  height: 40px;
}

.line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background-color: var(--axisColor);
}

.tickMarks {
  position: relative;
  height: 100%;
}

.tick {
  position: absolute;
  top: 0;
  height: 6px;
  width: 1px;
  background-color: var(--axisColor);
}

.tickLabel {
  position: absolute;
  top: 8px;
  left: 0;
  transform: translateX(-50%);
  font-size: 11px;
  color: var(--textSecondary);
  white-space: nowrap;
}

.details {
  margin-top: 16px;
  padding: 12px;
  background-color: var(--detailsBg);
  border-radius: 4px;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.timestamp {
  font-weight: 500;
  color: var(--textPrimary);
}

.value {
  font-family: var(--monoFont);
}

.traceInfo {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--borderColor);
}

.traceId, .spanId {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--monoFont);
  font-size: 12px;
}

.viewTraceButton {
  margin-left: auto;
  padding: 4px 8px;
  background-color: var(--buttonBg);
  color: var(--buttonColor);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.viewTraceButton:hover {
  background-color: var(--buttonHoverBg);
}

.attributes {
  margin-top: 8px;
}

.attributesTitle {
  font-size: 12px;
  font-weight: 500;
  color: var(--textSecondary);
  margin: 0 0 8px 0;
}

.attributesList {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 8px;
}

.attributeKey {
  color: var(--attrKeyColor);
  font-size: 12px;
}

.attributeValue {
  font-family: var(--monoFont);
  font-size: 12px;
}

.empty {
  padding: 24px;
  text-align: center;
  color: var(--textSecondary);
  font-style: italic;
}
```

## 6. Design Tokens

```css
:root {
  --dotColor: #666;
  --dotHoverColor: #999;
  --dotSelectedColor: #ffb74d;
  --axisColor: #444;
  --detailsBg: rgba(0, 0, 0, 0.1);
  --borderColor: #333;
  --buttonBg: #2a6fc7;
  --buttonColor: white;
  --buttonHoverBg: #3a7fd7;
  --attrKeyColor: #b0b0b0;
}
```

## 7. Interactions

| Action | Result |
|--------|--------|
| Hover on dot | Enlarges dot and shows tooltip with value and time |
| Click on dot | Selects exemplar, shows details panel |
| Click "View Trace" | Calls onExemplarClick with selected exemplar |
| Click copy button | Copies ID to clipboard |

## 8. Integration with exemplarExtractor

This component visualizes the exemplars extracted by exemplarExtractor.md, which:

1. Pulls exemplars from OTLP data model
2. Normalizes timestamps to Unix nanoseconds
3. Ensures all exemplars have consistent attribute structure
4. Correctly associates exemplars with their parent data points

## 9. Consumers

DataPointInspectorDrawer – renders this component when exemplars are available.

## 10. Tests

| Scenario | Expected |
|----------|----------|
| No exemplars | Shows empty state message |
| Single exemplar | Shows dot at center, no timeline scale |
| Multiple exemplars | Shows timeline with multiple dots |
| Select exemplar | Shows details panel with trace links |
| No trace ID | Trace section not shown |
| Click "View Trace" | onExemplarClick called with correct exemplar |

## 11. Accessibility

- Interactive elements have appropriate ARIA labels
- Color contrast meets WCAG AA standards
- Focus states for interactive elements
- Keyboard navigation support for timeline dots
- screenreader-friendly trace information

## 12. Performance

For large exemplar sets (>100), consider:
- Virtualization of timeline dots
- Clustering nearby dots when they would overlap
- Progressive loading of details
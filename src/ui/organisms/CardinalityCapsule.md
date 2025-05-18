# CardinalityCapsule.tsx – spec  
*(UI Organism · cardinality visualization w/ simulation controls)*

---

## 1. Purpose

Create a **visual control center** for cardinality understanding and simulation,
including:

* C-Ring cardinality utilization visual
* Series math formula showing attribute contribution
* Mini bar chart of top contributors
* Toggle for "Simulate Drop" functionality
* Updated series count when simulation is active

This component helps users understand and explore cardinality sources and reduction options.

---

## 2. Public Props

```ts
// src/ui/organisms/CardinalityCapsule.tsx

export interface CardinalityCapsuleProps {
  /** Current series count for the metric */
  seriesCount: number;
  
  /** Threshold where cardinality is considered "high" */
  thresholdHigh: number;
  
  /** Ordered list of attribute keys, sorted by cardinality impact */
  attrRank: string[];
  
  /** Map of attribute keys to their unique value counts */
  attrUniq: Record<string, number>;
  
  /** Currently focused attribute (may be null) */
  focusedAttrKey: string | null;
  
  /** Callback to focus a specific attribute */
  onFocusAttr: (key: string | null) => void;
  
  /** Callback to toggle drop simulation for an attribute */
  onToggleDrop: (attrKey: string, nextState: boolean) => void;
  
  /** Whether drop simulation is currently active */
  isDropSimActive: boolean;
  
  /** The attribute key currently being dropped (if any) */
  droppedKey: string | null;
}
```

## 3. Visual Structure

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│    *C-Ring*      32 SERIES                          │
│        ╭─╮     ┌─────────────────────────────────┐  │
│        │G│     │service.name(1)×host.name(8)×... │  │
│        ╰─╯     └─────────────────────────────────┘  │
│                                                     │
│ TOP CONTRIBUTORS TO CARDINALITY                     │
│ ┌─────────────────┬────────────────────────────┐    │
│ │ http.route      │ █████████████████████ 64   │    │
│ │ host.name       │ ████████              8    │    │
│ │ http.method     │ ████                  4    │    │
│ └─────────────────┴────────────────────────────┘    │
│                                                     │
│ ┌─────────────────────────────────────────────────┐ │
│ │ ☐ Simulate drop: http.route                     │ │
│ │                      → 4 series (93.75% less)   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 4. Component Implementation

```tsx
import React, { useState, useCallback } from 'react';
import styles from './CardinalityCapsule.module.css';
import { CRingSvg } from '@/ui/atoms/CRingSvg';
import { SeriesMathChip } from '@/ui/atoms/SeriesMathChip';
import { MiniBar } from '@/ui/atoms/MiniBar';
import { InstrumentBadge } from '@/ui/atoms/InstrumentBadge';

export const CardinalityCapsule: React.FC<CardinalityCapsuleProps> = ({
  seriesCount,
  thresholdHigh,
  attrRank,
  attrUniq,
  focusedAttrKey,
  onFocusAttr,
  onToggleDrop,
  isDropSimActive,
  droppedKey
}) => {
  // Local state for checkbox
  const [showSimulation, setShowSimulation] = useState(isDropSimActive);
  
  // Only show top 3 attributes in the mini bar chart
  const topAttributes = attrRank.slice(0, 3);
  
  // Handle checkbox change
  const handleToggleSimulation = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowSimulation(checked);
    
    // Only toggle if we have a focused attribute
    if (focusedAttrKey) {
      onToggleDrop(focusedAttrKey, checked);
    }
  }, [focusedAttrKey, onToggleDrop]);
  
  // Calculate reduction percentage if simulation active
  const reductionPct = isDropSimActive && droppedKey && attrUniq[droppedKey] ?
    Math.round((1 - (seriesCount / (seriesCount * attrUniq[droppedKey]))) * 100) : 0;
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.ringContainer}>
          <CRingSvg 
            seriesCount={seriesCount} 
            thresholdHigh={thresholdHigh}
            diameter={36}
          />
          <InstrumentBadge type="Gauge" size="small" />
        </div>
        
        <div className={styles.seriesCount}>
          <span className={styles.count}>{seriesCount}</span> SERIES
        </div>
      </div>
      
      <SeriesMathChip
        attrKeys={attrRank}
        attrUniq={attrUniq}
        seriesCount={seriesCount}
        highlightKey={focusedAttrKey}
        className={styles.mathChip}
      />
      
      <div className={styles.contributorsSection}>
        <h4 className={styles.sectionTitle}>TOP CONTRIBUTORS TO CARDINALITY</h4>
        <div className={styles.miniBars}>
          {topAttributes.map(attr => (
            <div 
              key={attr}
              className={`${styles.miniBarRow} ${focusedAttrKey === attr ? styles.focused : ''}`}
              onClick={() => onFocusAttr(focusedAttrKey === attr ? null : attr)}
            >
              <div className={styles.attrName}>{attr}</div>
              <div className={styles.barContainer}>
                <MiniBar 
                  value={attrUniq[attr]} 
                  max={attrUniq[topAttributes[0]]} // Use highest as max
                />
                <span className={styles.barValue}>{attrUniq[attr]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {focusedAttrKey && (
        <div className={styles.simulationSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showSimulation}
              onChange={handleToggleSimulation}
              className={styles.checkbox}
            />
            Simulate drop: <span className={styles.focusedAttr}>{focusedAttrKey}</span>
          </label>
          
          {isDropSimActive && droppedKey && (
            <div className={styles.simulationResult}>
              → <strong>{seriesCount}</strong> series (<strong>{reductionPct}%</strong> less)
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

## 5. CSS & Styling

```css
.container {
  background-color: var(--cardBg);
  border-radius: 6px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.ringContainer {
  position: relative;
  width: 36px;
  height: 36px;
}

.seriesCount {
  font-size: 14px;
  color: var(--textSecondary);
}

.count {
  font-size: 20px;
  font-weight: 600;
  color: var(--textPrimary);
}

.mathChip {
  align-self: flex-start;
}

.contributorsSection {
  margin-top: 8px;
}

.sectionTitle {
  font-size: 12px;
  font-weight: 500;
  color: var(--textSecondary);
  margin-bottom: 8px;
  text-transform: uppercase;
}

.miniBars {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.miniBarRow {
  display: grid;
  grid-template-columns: 120px 1fr;
  align-items: center;
  padding: 4px;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.miniBarRow:hover {
  background-color: var(--hoverBg);
}

.focused {
  background-color: var(--focusBg);
}

.attrName {
  font-size: 13px;
  color: var(--textPrimary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.barContainer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.barValue {
  font-size: 13px;
  color: var(--textSecondary);
  min-width: 36px;
  text-align: right;
}

.simulationSection {
  margin-top: 8px;
  padding: 12px;
  background-color: var(--simulationBg);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.checkboxLabel {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--textPrimary);
  cursor: pointer;
}

.checkbox {
  height: 16px;
  width: 16px;
}

.focusedAttr {
  font-weight: 500;
  color: var(--highlightColor);
}

.simulationResult {
  font-size: 14px;
  color: var(--textSecondary);
  margin-left: 24px;
}
```

## 6. Interaction Flow

1. User clicks on attribute row in mini-bars
   - focusedAttrKey is set in parent component
   - Row highlights, simulation checkbox becomes available

2. User toggles "Simulate drop" checkbox
   - Local checkbox state updates immediately
   - onToggleDrop callback fires with (focusedAttrKey, checked)
   - Parent component calls metricProcessor with simulateDropAttributeKey
   - Updated props flow back showing new seriesCount

3. User unchecks "Simulate drop" checkbox
   - Simulation is deactivated
   - Original seriesCount is restored

## 7. Consumers

DataPointInspectorDrawer – renders this component in the upper section.

## 8. Dependencies on Child Components

- CRingSvg: Visualizes cardinality as ring around instrument icon
- SeriesMathChip: Shows the cardinality formula with attribute counts
- MiniBar: Renders horizontal bars for top contributors
- InstrumentBadge: Shows metric type icon in center of C-Ring

## 9. Integration with Parent Components

Parent component must:
1. Maintain focusedAttrKey state
2. Handle the onToggleDrop callback by:
   - Updating local droppedKey state
   - Calling metricProcessor with simulateDropAttributeKey
   - Updating seriesCount prop with new calculated value

## 10. Tests

| Scenario | Expected |
|----------|----------|
| Initial render | Shows series count, formula, and bars |
| Click on attribute | Calls onFocusAttr with key |
| Click again | Calls onFocusAttr with null |
| Toggle simulation | Calls onToggleDrop(key, true) |
| With simulation active | Shows percentage reduction |
| No focused attribute | Simulation section not shown |

## 11. Storybook

Stories for:
- Default view
- With focused attribute
- With simulation active
- Various cardinality levels (low, medium, high)
- Different top contributor distributions

## 12. Accessibility

- Proper color contrast (4.5:1)
- Keyboard navigation for minibar rows
- Focus states for interactive elements
- ARIA labels for input controls
- Alternative text descriptions for visual indicators

## 13. Performance

Most calculations happen in the parent component. This component focuses on rendering and user interaction, with minimal local state.
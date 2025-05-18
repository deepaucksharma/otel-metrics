# GaugeCard.tsx – spec
*(UI Atom · radial gauge visualization)*

---

## 1. Purpose

Display a **radial gauge visualization** for gauge metrics and up-down counters. The component creates a visually appealing, intuitive representation of a single metric value within its expected range.

---

## 2. Public Props

```ts
interface GaugeCardProps {
  /** The current value to display */
  value: number;
  
  /** Optional unit of measurement */
  unit?: string;
  
  /** Minimum value (default: 0) */
  min?: number;
  
  /** Maximum value (default: auto-determined or 100) */
  max?: number;
  
  /** Optional colors for different ranges */
  ranges?: Array<{
    value: number;
    color: string;
  }>;
  
  /** Optional className for container */
  className?: string;
}
```

## 3. Visual Appearance

```
┌─────────────────────────────────────────┐
│                                         │
│              ╭───────────╮              │
│             /      |      \             │
│            |               |            │
│            |       •       |            │
│            |               |            │
│             \             /             │
│              ╰───────────╯              │
│                                         │
│               245.8 ms                  │
│                                         │
└─────────────────────────────────────────┘
```

## 4. Implementation

```tsx
import React from 'react';
import styles from './GaugeCard.module.css';
import { formatDuration } from '@/utils/formatters';

export const GaugeCard: React.FC<GaugeCardProps> = ({
  value,
  unit,
  min = 0,
  max,
  ranges,
  className,
}) => {
  // Auto-determine max if not provided
  const effectiveMax = max || Math.max(value * 1.5, 100);
  
  // Calculate angle for gauge needle (0 to 180 degrees)
  const angle = ((value - min) / (effectiveMax - min)) * 180;
  
  // Determine color based on ranges or default to primary color
  const gaugeColor = determineColor(value, ranges);
  
  // Format value with appropriate unit
  const formattedValue = unit ? formatDuration(value, unit) : value.toString();
  
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.gauge}>
        <svg viewBox="0 0 100 50" className={styles.gaugeSvg}>
          {/* Gauge background arc */}
          <path
            d="M 10,50 A 40,40 0 0,1 90,50"
            className={styles.gaugeBackground}
          />
          
          {/* Gauge fill arc */}
          <path
            d={`M 50,50 A 40,40 0 0,1 ${50 + 40 * Math.sin(angle * Math.PI / 180)},${50 - 40 * Math.cos(angle * Math.PI / 180)}`}
            style={{ stroke: gaugeColor }}
            className={styles.gaugeFill}
          />
          
          {/* Needle */}
          <line
            x1="50"
            y1="50"
            x2={50 + 45 * Math.sin(angle * Math.PI / 180)}
            y2={50 - 45 * Math.cos(angle * Math.PI / 180)}
            className={styles.needle}
          />
          
          {/* Center point */}
          <circle cx="50" cy="50" r="3" className={styles.needleCenter} />
        </svg>
      </div>
      
      <div className={styles.value}>
        {formattedValue}
      </div>
    </div>
  );
};

// Helper function to determine gauge color based on ranges
function determineColor(value: number, ranges?: Array<{ value: number; color: string }>) {
  if (!ranges || ranges.length === 0) {
    return 'var(--gaugeDefaultColor)';
  }
  
  // Sort ranges by value
  const sortedRanges = [...ranges].sort((a, b) => a.value - b.value);
  
  // Find applicable range
  for (let i = 0; i < sortedRanges.length; i++) {
    if (value <= sortedRanges[i].value) {
      return sortedRanges[i].color;
    }
  }
  
  // Use the highest range color if value exceeds all ranges
  return sortedRanges[sortedRanges.length - 1].color;
}
```

## 5. CSS & Styling

```css
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background-color: var(--cardBg);
  border-radius: 6px;
}

.gauge {
  width: 200px;
  height: 100px;
  position: relative;
}

.gaugeSvg {
  width: 100%;
  height: 100%;
}

.gaugeBackground {
  fill: none;
  stroke: var(--gaugeBackgroundColor);
  stroke-width: 8;
  stroke-linecap: round;
}

.gaugeFill {
  fill: none;
  stroke-width: 8;
  stroke-linecap: round;
}

.needle {
  stroke: var(--needleColor);
  stroke-width: 2;
  stroke-linecap: round;
}

.needleCenter {
  fill: var(--needleColor);
}

.value {
  font-size: 24px;
  font-weight: 500;
  margin-top: 16px;
  font-family: var(--monoFont);
}
```

## 6. Design Tokens

```css
:root {
  --gaugeBackgroundColor: rgba(255, 255, 255, 0.1);
  --gaugeDefaultColor: #3498db;
  --needleColor: #e74c3c;
  --cardBg: rgba(0, 0, 0, 0.05);
}
```

## 7. Consumers

ValueZone – renders this component for gauge and up-down counter metrics.

## 8. Animations

Optional animations can be added for value changes:

```css
.needle {
  transition: all 0.5s ease-out;
  transform-origin: center;
}
```

## 9. Tests

| Scenario | Expected |
|----------|----------|
| Basic render | Shows gauge with value |
| With unit | Shows formatted value with unit |
| Custom min/max | Correct needle position |
| Value exceeds max | Needle stops at max position |
| With ranges | Correct color based on value |
| Large value | Properly formatted with formatDuration |

## 10. Accessibility

- High contrast between gauge elements
- Non-reliance on color alone (position of needle conveys value)
- Text representation of the value below the gauge
- Animated transitions respect prefers-reduced-motion setting

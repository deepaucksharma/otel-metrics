# CounterCard.tsx – spec
*(UI Atom · numeric counter display)*

---

## 1. Purpose

Display a **prominently formatted counter value** for monotonic sum metrics. The component renders cumulative counter values with appropriate formatting and visual emphasis, making it easy to read large numeric values at a glance.

---

## 2. Public Props

```ts
interface CounterCardProps {
  /** The current counter value to display */
  value: number;
  
  /** Optional unit of measurement */
  unit?: string;
  
  /** Optional delta from previous value */
  delta?: number;
  
  /** Show SI notation for large numbers (K, M, G) */
  useSINotation?: boolean;
  
  /** Optional className for container */
  className?: string;
}
```

## 3. Visual Appearance

```
┌─────────────────────────────────────────┐
│                                         │
│              8,945,721                  │
│                                         │
│               requests                  │
│                                         │
│              +124 ↑                     │
│                                         │
└─────────────────────────────────────────┘
```

With SI notation enabled:
```
┌─────────────────────────────────────────┐
│                                         │
│                8.9M                     │
│                                         │
│               requests                  │
│                                         │
│              +124 ↑                     │
│                                         │
└─────────────────────────────────────────┘
```

## 4. Implementation

```tsx
import React from 'react';
import styles from './CounterCard.module.css';
import { fmtInt, fmtSI, fmtDeltaAbs } from '@/utils/formatters';

export const CounterCard: React.FC<CounterCardProps> = ({
  value,
  unit,
  delta,
  useSINotation = false,
  className,
}) => {
  // Format value based on options
  const formattedValue = useSINotation 
    ? fmtSI(value) 
    : fmtInt(value);
  
  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.value}>
        {formattedValue}
      </div>
      
      {unit && (
        <div className={styles.unit}>
          {unit}
        </div>
      )}
      
      {delta !== undefined && (
        <div className={`${styles.delta} ${delta >= 0 ? styles.positive : styles.negative}`}>
          {fmtDeltaAbs(delta)} {delta >= 0 ? '↑' : '↓'}
        </div>
      )}
    </div>
  );
};
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

.value {
  font-size: 32px;
  font-weight: 700;
  font-family: var(--monoFont);
  color: var(--counterValueColor);
}

.unit {
  font-size: 14px;
  color: var(--counterUnitColor);
  margin-top: 4px;
}

.delta {
  font-size: 16px;
  font-weight: 500;
  margin-top: 12px;
  font-family: var(--monoFont);
}

.positive {
  color: var(--counterPositiveColor);
}

.negative {
  color: var(--counterNegativeColor);
}
```

## 6. Design Tokens

```css
:root {
  --counterValueColor: #ffffff;
  --counterUnitColor: rgba(255, 255, 255, 0.7);
  --counterPositiveColor: #2ecc71;
  --counterNegativeColor: #e74c3c;
  --cardBg: rgba(0, 0, 0, 0.05);
}
```

## 7. Consumers

ValueZone – renders this component for monotonic sum metrics.

## 8. Animations

For changing values:

```css
.value, .delta {
  transition: all 0.3s ease-out;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

.valueChanged {
  animation: pulse 0.5s ease-out;
}
```

## 9. Tests

| Scenario | Expected |
|----------|----------|
| Basic render | Shows formatted value |
| With unit | Shows unit text |
| With positive delta | Shows delta with up arrow in green |
| With negative delta | Shows delta with down arrow in red |
| Large value with SI | Shows in K, M, G notation |
| Large value without SI | Shows with thousand separators |

## 10. Accessibility

- High contrast for the main counter value
- Visual indication of increase/decrease that doesn't rely solely on color
- Text for all informational elements (no images without alt text)
- Animations respect prefers-reduced-motion setting

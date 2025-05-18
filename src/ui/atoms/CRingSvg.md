# CRingSvg.tsx – spec  
*(UI Atom · circular progress ring for series-count load)*

---

## 1. Purpose

Render a **concentric SVG arc** around the metric-instrument badge in the
Inspector header, visually encoding:

seriesCount / thresholdHigh

Colour transitions smoothly from **green → amber → red** as utilisation
approaches / exceeds the threshold.

---

## 2. Public Props

```ts
interface CRingSvgProps {
  /** Numerator – actual series count for the metric. */
  seriesCount   : number;

  /** Denominator – threshold where "high cardinality" starts. */
  thresholdHigh : number;

  /** Outer diameter in px – default 24 (badge size + padding). */
  diameter?     : number;

  /** Ring thickness – default 3 px. */
  strokeWidth?  : number;

  /** Animation flag – draws arc with CSS transition (default true). */
  animated?     : boolean;

  /** aria-label override. */
  ariaLabel?    : string;
}
```

## 3. Colour Mapping
| Utilisation (seriesCount / thresholdHigh) | Stroke colour token |
|-------------------------------------------|---------------------|
| 0 – 60 % | --ringOkGreen |
| 60 – 85 % | --ringWarnAmber |
| > 85 % | --ringAlertRed |

Linear gradient not used; discrete step keeps colour meaning clear.

## 4. Implementation Outline

```tsx
import styles from './CRingSvg.module.css';

export const CRingSvg: React.FC<CRingSvgProps> = ({
  seriesCount,
  thresholdHigh,
  diameter = 24,
  strokeWidth = 3,
  animated = true,
  ariaLabel
}) => {
  const pct = Math.min(seriesCount / thresholdHigh, 1);
  const radius = (diameter - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  const colour =
    pct > 0.85 ? 'var(--ringAlertRed)' :
    pct > 0.60 ? 'var(--ringWarnAmber)' :
                 'var(--ringOkGreen)';

  return (
    <svg
      width={diameter}
      height={diameter}
      className={styles.ring}
      aria-label={ariaLabel ?? `${seriesCount} of ${thresholdHigh} series`}
    >
      <circle
        className={animated ? styles.track : undefined}
        cx={diameter/2} cy={diameter/2} r={radius}
        stroke="var(--ringTrackGrey)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        className={animated ? styles.progress : undefined}
        cx={diameter/2} cy={diameter/2} r={radius}
        stroke={colour}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
};
```

CRingSvg.module.css:

```css
.ring       { transform: rotate(-90deg); }
.track      { }
.progress   { transition: stroke-dashoffset .4s ease, stroke .4s ease; }
```

## 5. Accessibility
role="img" automatically inferred by SVG.

aria-label provides numeric context for screen readers.

## 6. Design Tokens ([tokens.css](../tokens.css.md))

```css
:root {
  --ringTrackGrey : #3a3a3a;
  --ringOkGreen   : #2ecc71;
  --ringWarnAmber : #ffb74d;
  --ringAlertRed  : #ff5252;
}
```

Contrast ≥ 3:1 against Inspector header background (#1e1e1e).

## 7. Consumers
InspectorHeader layout – positioned absolutely behind instrument icon.

## 8. Tests / Storybook
Storybook controls: seriesCount, thresholdHigh to see colour ramps.

RTL snapshot: verifies stroke-dashoffset equals expected value.

## 9. Performance
SVG with two circles; no reflow on updates—just stroke-offset animation.
# RarityDot.tsx – spec  
*(UI Atom · displays colour-coded rarity of an attribute value)*

---

## 1. Purpose

A tiny circular indicator used inside the Attribute Zone list to show **how
rare or common** an attribute's value is within its metric:

* **Green** — "common" (≥ 20 % of series)
* **Amber** — "uncommon" (5 – 20 %)
* **Red**   — "rare" (< 5 %)

Exact thresholds come from design tokens.

---

## 2. Public Props

```ts
interface RarityDotProps {
  /** Percentage of series containing this value (0–100) */
  rarityPercent: number;
  /** Diameter in px, default 8 */
  size?: number;
  /** Callback when user clicks the dot (highlight attribute row) */
  onClick?: () => void;
  /** Accessible label; defaults to "occurs in X % of series" */
  ariaLabel?: string;
}
```

## 3. Visual Design
<div> with border-radius:50%, fixed inline-block.

Colour via CSS classes:

| CSS class | Fill token | Condition |
|-----------|------------|-----------|
| .rarity-lo | --rarityGreen | ≥ 20 % |
| .rarity-mid | --rarityAmber | 5 – 20 % |
| .rarity-hi | --rarityRed | < 5 % |

Hover/active state lightens colour by 10 %.

## 4. Implementation Sketch

```tsx
import clsx from 'clsx';
import styles from './RarityDot.module.css';

export const RarityDot: React.FC<RarityDotProps> = ({
  rarityPercent,
  size = 8,
  onClick,
  ariaLabel
}) => {
  const rarityClass =
    rarityPercent < 5  ? styles.rarityHi  :
    rarityPercent < 20 ? styles.rarityMid :
                         styles.rarityLo;

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel ?? `occurs in ${rarityPercent.toFixed(1)}% of series`}
      onClick={onClick}
      onKeyDown={e => { if (e.key === 'Enter' && onClick) onClick(); }}
      className={clsx(styles.dot, rarityClass)}
      style={{ width: size, height: size }}
    />
  );
};
```

RarityDot.module.css:

```css
.dot          { border-radius: 50%; display:inline-block; cursor:pointer; }
.rarityLo     { background: var(--rarityGreen); }
.rarityMid    { background: var(--rarityAmber); }
.rarityHi     { background: var(--rarityRed); }
.dot:hover    { filter: brightness(1.1); }
```

## 5. Dependencies
clsx (utility)

Design tokens in tokens.css

## 6. Accessibility
Keyboard focusable when onClick provided.

Uses aria-label; no text visible but dot contrast satisfies WCAG with
background component.

## 7. Tests / Storybook
Storybook stories: 1 %, 10 %, 50 % states; click action logs.

Jest + RTL:

✓ renders correct class for given percent

✓ fires onClick on Enter key

## 8. Performance
Single div; negligible rendering cost even for 1 k rows.
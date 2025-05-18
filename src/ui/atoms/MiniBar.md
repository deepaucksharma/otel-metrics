# MiniBar.tsx – spec  
*(UI Atom · horizontal bar scaled by % width)*

---

## 1. Purpose

A lightweight `<div>` bar that visually encodes a numerical proportion—used in
the **Cardinality Capsule** list to show an attribute key's *share of total
series*.

---

## 2. Public Props

```ts
interface MiniBarProps {
  /** Width as percentage of parent (0–100). */
  percent: number;
  /** Bar height in px – default 8. */
  height?: number;
  /** Colour token name – default `--metricBlue`. */
  colorToken?: string;
  /** Optional label inside bar (e.g., count), auto hidden if width < 15 %. */
  label?: string;
  /** Extra className for layout wrapper. */
  className?: string;
}
```

## 3. Render Contract

```tsx
<div className={wrapperClass}>
  <div className={styles.bar} style={{
        width : `${percent}%`,
        height: `${height}px`,
        background: `var(${colorToken})`
      }}>
    {showLabel ? <span className={styles.label}>{label}</span> : null}
  </div>
</div>
```

wrapperClass merges styles.wrapper + className.

If percent === 0 → renders 1-px placeholder so count text still aligns.

## 4. CSS (module)

```css
.wrapper { width: 100%; background: var(--barTrack); border-radius: 4px; }
.bar     { display: flex; align-items: center; border-radius: 4px; transition: width .2s ease; }
.label   { color:#fff; font-size:0.7rem; line-height:1; padding-left:4px; white-space:nowrap; }
```

## 5. Design Tokens ([tokens.css](../tokens.css.md))
| Token | Default Hex | Usage |
|-------|-------------|-------|
| --metricBlue | #3399ff | default fill |
| --barTrack | #2b2b2b | track/backdrop of wrapper |

Tokens set in [tokens.css](../tokens.css.md).

## 6. Accessibility
<div role="img" aria-label="X percent"> on bar for screen readers.

Label text visible at ≥ 15 % width; else relies on aria-label.

## 7. Consumers
CardinalityCapsule organism (top N attribute mini-bars).

Could be reused in future dashboard trendlets.

## 8. Tests / Storybook
Storybook: 0 %, 10 %, 50 %, 100 % variants + dark/light preview.

RTL tests:

width style equals ${percent}%

label hidden when percent < 15

## 9. Performance
Pure CSS; 60 fps width transition on most systems.
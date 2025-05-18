import React from 'react';
import styles from './MiniBar.module.css';

/**
 * Horizontal bar that visualizes a numerical proportion.
 *
 * Wrapper merges `styles.wrapper` with `className`.
 * If the percentage is `0`, a 1&nbsp;px bar is rendered so count text still
 * aligns.
 *
 * CSS reference:
 * ```css
 * .wrapper { width: 100%; background: var(--barTrack); border-radius: 4px; }
 * .bar     { display: flex; align-items: center; border-radius: 4px; transition: width .2s ease; }
 * .label   { color: #fff; font-size: 0.7rem; line-height: 1; padding-left: 4px; white-space: nowrap; }
 * ```
 *
 * @example
 * ```tsx
 * <MiniBar value={50} max={100} label="500" />
 * ```
 */
export interface MiniBarProps {
  /** Current value represented by the bar. */
  value: number;
  /** Maximum possible value used to calculate the percentage. */
  max: number;
  /** Bar height in px – default 8. */
  height?: number;
  /** Colour token name – default `--metricBlue`. */
  colorToken?: string;
  /** Optional label inside bar (e.g., count), auto hidden if width < 15 %. */
  label?: string;
  /** Extra className for layout wrapper. */
  className?: string;
}

export const MiniBar: React.FC<MiniBarProps> = ({
  value,
  max,
  height = 8,
  colorToken = '--metricBlue',
  label,
  className,
}) => {
  const percent = max > 0 ? (value / max) * 100 : 0;
  const widthStyle = percent === 0 ? '1px' : `${percent}%`;
  const showLabel = !!label && percent >= 15;
  const wrapperClass = [styles.wrapper, className].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      <div
        className={styles.bar}
        style={{
          width: widthStyle,
          height: `${height}px`,
          background: `var(${colorToken})`,
        }}
        role="img"
        aria-label={`${percent}%`}
      >
        {showLabel && <span className={styles.label}>{label}</span>}
      </div>
    </div>
  );
};

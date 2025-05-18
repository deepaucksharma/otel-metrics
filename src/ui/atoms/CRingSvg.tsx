/**
 * @file src/ui/atoms/CRingSvg.tsx
 * @summary CRingSvg module
 * @layer UI Components
 * @remarks
 * Layer derived from Architecture-Principles.md.
 */
import React from 'react';
import styles from './CRingSvg.module.css';

/**
 * Circular progress ring visualising metric series count utilisation.
 *
 * The SVG contains two concentric `<circle>` elements rotated -90° so the
 * progress arc starts at the 12 o'clock position.
 * - The **track** circle represents the full threshold radius.
 * - The **progress** circle displays the current utilisation via its
 *   `stroke-dashoffset` value.
 */
export interface CRingSvgProps {
  /** Actual number of series present for the metric. */
  seriesCount: number;
  /** Threshold above which cardinality is considered high. */
  thresholdHigh: number;
  /** Outer diameter of the ring in pixels (default `24`). */
  diameter?: number;
  /** Thickness of the ring stroke (default `3`). */
  strokeWidth?: number;
  /** Animate progress updates with CSS transitions (default `true`). */
  animated?: boolean;
  /** Accessible label, defaults to "{seriesCount} of {thresholdHigh} series". */
  ariaLabel?: string;
}

/**
 * Renders a coloured progress arc around the metric badge reflecting series
 * utilisation against the `thresholdHigh` value.
 */
export const CRingSvg: React.FC<CRingSvgProps> = ({
  seriesCount,
  thresholdHigh,
  diameter = 24,
  strokeWidth = 3,
  animated = true,
  ariaLabel,
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
        cx={diameter / 2}
        cy={diameter / 2}
        r={radius}
        stroke="var(--ringTrackGrey)"
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        className={animated ? styles.progress : undefined}
        cx={diameter / 2}
        cy={diameter / 2}
        r={radius}
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


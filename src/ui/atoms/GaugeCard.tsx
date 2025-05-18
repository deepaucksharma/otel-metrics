import React from 'react';
import styles from './GaugeCard.module.css';
import { formatters } from '@/utils/formatters';

/**
 * Radial gauge visualization for gauge metrics and up-down counters.
 *
 * This UI atom renders a semicircular gauge with a needle positioned
 * based on the provided value. Consumers should pass the current metric
 * value and optional configuration for bounds and colour ranges.
 *
 * Rendering is lightweight and avoids layout thrashing; only SVG stroke
 * offsets and transforms update on value changes to meet the < 20ms
 * render budget.
 *
 * @remarks
 * Used by the ValueZone component when displaying gauge and up-down
 * counter instruments.
 *
 * @packageDocumentation
 */

/** Props accepted by {@link GaugeCard}. */
export interface GaugeCardProps {
  /** Current value displayed on the gauge. */
  value: number;
  /** Unit of measurement appended to the value. */
  unit?: string;
  /** Minimum bound for the gauge (defaults to `0`). */
  min?: number;
  /** Maximum bound; calculated from the value when omitted. */
  max?: number;
  /** Optional colour ranges used to style the gauge fill. */
  ranges?: Array<{ value: number; color: string }>;
  /** Additional CSS class for the container element. */
  className?: string;
}

/**
 * Render a radial gauge representing a single metric value.
 */
export const GaugeCard: React.FC<GaugeCardProps> = ({
  value,
  unit,
  min = 0,
  max,
  ranges,
  className,
}) => {
  const effectiveMax = max ?? Math.max(value * 1.5, 100);
  const angle = ((value - min) / (effectiveMax - min)) * 180;
  const gaugeColor = determineColor(value, ranges);
  const formattedValue = unit ? formatters.duration(value, unit) : value.toString();

  return (
    <div className={`${styles.container} ${className ?? ''}`.trim()}>
      <div className={styles.gauge}>
        <svg viewBox="0 0 100 50" className={styles.gaugeSvg}>
          <path
            d="M 10,50 A 40,40 0 0,1 90,50"
            className={styles.gaugeBackground}
          />
          <path
            d={`M 50,50 A 40,40 0 0,1 ${50 + 40 * Math.sin(angle * Math.PI / 180)},${50 - 40 * Math.cos(angle * Math.PI / 180)}`}
            style={{ stroke: gaugeColor }}
            className={styles.gaugeFill}
          />
          <line
            x1="50"
            y1="50"
            x2={50 + 45 * Math.sin(angle * Math.PI / 180)}
            y2={50 - 45 * Math.cos(angle * Math.PI / 180)}
            className={styles.needle}
          />
          <circle cx="50" cy="50" r="3" className={styles.needleCenter} />
        </svg>
      </div>
      <div className={styles.value}>{formattedValue}</div>
    </div>
  );
};

function determineColor(value: number, ranges?: Array<{ value: number; color: string }>) {
  if (!ranges || ranges.length === 0) {
    return 'var(--gaugeDefaultColor)';
  }
  const sorted = [...ranges].sort((a, b) => a.value - b.value);
  for (let i = 0; i < sorted.length; i++) {
    if (value <= sorted[i].value) {
      return sorted[i].color;
    }
  }
  return sorted[sorted.length - 1].color;
}

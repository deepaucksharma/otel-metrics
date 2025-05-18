/**
 * @file src/ui/atoms/CounterCard.tsx
 * @summary CounterCard module
 * @layer UI Components
 * @remarks
 * Layer derived from Architecture-Principles.md.
 */
/**
 * Numeric counter display for monotonic sum metrics.
 *
 * Renders a formatted counter value with optional unit and delta.
 * The value can be shown using SI notation (K, M, G) for readability.
 *
 * @remarks
 * Storybook variants showcase default, with unit, positive delta,
 * negative delta and SI notation modes.
 */
import React from 'react';
import styles from './CounterCard.module.css';
import { fmtInt, fmtSI, fmtDeltaAbs } from '@/utils/formatters';

/**
 * Props for {@link CounterCard}.
 */
export interface CounterCardProps {
  /** The current counter value to display. */
  value: number;
  /** Optional unit of measurement. */
  unit?: string;
  /** Optional delta from previous value. */
  delta?: number;
  /** Show SI notation for large numbers (K, M, G). */
  useSINotation?: boolean;
  /** Optional className for the container. */
  className?: string;
}

/**
 * Display a prominently formatted counter value.
 *
 * @param props - {@link CounterCardProps}
 * @returns JSX element containing the counter display.
 */
export const CounterCard: React.FC<CounterCardProps> = ({
  value,
  unit,
  delta,
  useSINotation = false,
  className,
}) => {
  // Format value based on options
  const formattedValue = useSINotation ? fmtSI(value) : fmtInt(value);

  return (
    <div className={`${styles.container} ${className || ''}`.trim()}>
      <div className={styles.value}>{formattedValue}</div>
      {unit && <div className={styles.unit}>{unit}</div>}
      {delta !== undefined && (
        <div
          className={`${styles.delta} ${
            delta >= 0 ? styles.positive : styles.negative
          }`}
        >
          {fmtDeltaAbs(delta)} {delta >= 0 ? '↑' : '↓'}
        </div>
      )}
    </div>
  );
};

/**
 * Storybook showcases the following variants:
 * - Default display
 * - With unit text
 * - Positive delta
 * - Negative delta
 * - SI notation enabled
 */
export default CounterCard;

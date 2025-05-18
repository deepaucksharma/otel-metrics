/**
 * @layer UI Components
 * @summary TODO
 *
 * ## Purpose
 *
 * TODO
 *
 * ## Algorithm/Visual
 *
 * TODO
 *
 * @perfBudget TODO
 * @loc_estimate TODO
 */

import React from 'react';
import clsx from 'clsx';
import styles from './RarityDot.module.css';

/**
 * Tiny indicator showing how rare or common an attribute value is.
 *
 * @remarks
 * The dot uses color tokens to visualise rarity levels:
 * - `--rarityGreen` for values occurring in at least 20% of series.
 * - `--rarityAmber` for values occurring in 5–20% of series.
 * - `--rarityRed` for values occurring in less than 5% of series.
 *
 * @example
 * ```tsx
 * <RarityDot
 *   rarityPercent={12.3}
 *   onClick={() => {
 *     // highlight
 *   }}
 * />
 * ```
 */
export interface RarityDotProps {
  /** Percentage of series containing this value (0–100) */
  rarityPercent: number;
  /** Diameter in pixels. Default is `8`. */
  size?: number;
  /** Optional click handler, used to highlight the attribute row. */
  onClick?: () => void;
  /** Accessible label for assistive tech. Defaults to "occurs in X % of series". */
  ariaLabel?: string;
}

/** Tiny indicator showing how rare or common an attribute value is. */
export const RarityDot: React.FC<RarityDotProps> = ({
  rarityPercent,
  size = 8,
  onClick,
  ariaLabel,
}) => {
  const rarityClass =
    rarityPercent < 5 ? styles.rarityHi :
    rarityPercent < 20 ? styles.rarityMid :
    styles.rarityLo;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && onClick) onClick();
  };

  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel ?? `occurs in ${rarityPercent.toFixed(1)}% of series`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={clsx(styles.dot, rarityClass)}
      style={{ width: size, height: size }}
    />
  );
};

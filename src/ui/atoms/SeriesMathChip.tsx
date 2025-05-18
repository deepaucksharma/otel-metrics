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

import React, { useMemo } from 'react';
import styles from './SeriesMathChip.module.css';

/**
 * Compact formula-like visualization of series cardinality.
 *
 * This atom shows how individual attributes multiply to produce the total
 * series count. It renders in three variants:
 *
 * - **default** – inline formula: `service.name(1) × host.name(8) = 8`
 * - **compact** – first attribute then ellipsis, always showing final count
 * - **expanded** – multiline list with each attribute on its own row
 *
 * Consumers:
 * - CardinalityCapsule (primary)
 * - InspectorHeader (compact header usage)
 * - MetricInstanceWidget (metric overview)
 */
export interface SeriesMathChipProps {
  /** Ordered array of attribute keys that affect cardinality */
  attrKeys: string[];
  /** Map of attribute keys to their unique value counts */
  attrUniq: Record<string, number>;
  /** Current total series count */
  seriesCount: number;
  /** Optional highlighted attribute key */
  highlightKey?: string | null;
  /** Optional variant for styling */
  variant?: 'default' | 'compact' | 'expanded';
  /** Optional class name */
  className?: string;
}

export const SeriesMathChip: React.FC<SeriesMathChipProps> = React.memo(
  ({
    attrKeys,
    attrUniq,
    seriesCount,
    highlightKey = null,
    variant = 'default',
    className,
  }) => {
    const validAttrKeys = useMemo(
      () => attrKeys.filter((key) => key in attrUniq),
      [attrKeys, attrUniq]
    );

    const ariaLabel = useMemo(() => {
      if (validAttrKeys.length === 0) return `${seriesCount} total series`;
      const formula = validAttrKeys
        .map((key) => `${key} with ${attrUniq[key] || 1} values`)
        .join(' multiplied by ');
      return `Series cardinality: ${formula} equals ${seriesCount} total series`;
    }, [validAttrKeys, attrUniq, seriesCount]);

    if (variant === 'compact') {
      return (
        <div
          className={`${styles.chip} ${styles.compact} ${className || ''}`}
          aria-label={ariaLabel}
        >
          {validAttrKeys.length > 0 ? (
            <>
              <span
                className={
                  highlightKey === validAttrKeys[0] ? styles.highlight : ''
                }
              >
                {validAttrKeys[0]}
              </span>
              {validAttrKeys.length > 1 && (
                <span className={styles.operator}> × </span>
              )}
              {validAttrKeys.length > 1 && <span>...</span>}
              <span className={styles.equals}> × {seriesCount}</span>
            </>
          ) : (
            <span>{seriesCount} series</span>
          )}
        </div>
      );
    }

    if (variant === 'expanded') {
      return (
        <div
          className={`${styles.chip} ${styles.expanded} ${className || ''}`}
          aria-label={ariaLabel}
        >
          {validAttrKeys.map((key, i) => (
            <div
              key={key}
              className={`${styles.row} ${
                highlightKey === key ? styles.highlight : ''
              }`}
            >
              {i > 0 && <span className={styles.operator}>×</span>}
              <span className={styles.attrKey}>{key}</span>
              <span className={styles.count}>({attrUniq[key] || 1})</span>
            </div>
          ))}
          <div className={styles.equals}>= {seriesCount} series</div>
        </div>
      );
    }

    return (
      <div className={`${styles.chip} ${className || ''}`} aria-label={ariaLabel}>
        {validAttrKeys.map((key, i) => (
          <React.Fragment key={key}>
            {i > 0 && <span className={styles.operator}>×</span>}
            <span
              className={`${styles.attrPair} ${
                highlightKey === key ? styles.highlight : ''
              }`}
            >
              {key}({attrUniq[key] || 1})
            </span>
          </React.Fragment>
        ))}
        {validAttrKeys.length > 0 && (
          <span className={styles.equals}>= {seriesCount}</span>
        )}
        {validAttrKeys.length === 0 && <span>{seriesCount} series</span>}
      </div>
    );
  }
);

SeriesMathChip.displayName = 'SeriesMathChip';

export default SeriesMathChip;

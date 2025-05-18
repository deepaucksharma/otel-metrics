import React from 'react';
import styles from './InspectorHeader.module.css';
import { CRingSvg } from '@/ui/atoms/CRingSvg';
import { InstrumentBadge } from '@/ui/atoms/InstrumentBadge';
import type { MetricDefinition, SeriesCount } from '@/contracts/types';

/**
 * Fixed header for the DataPointInspectorDrawer displaying metric info.
 *
 * @remarks This component remains sticky at the top of the drawer, showing
 * metric name, description, instrument type and a cardinality ring. A close
 * button is provided for accessibility.
 */
export interface InspectorHeaderProps {
  /** Metric schema definition */
  metricDefinition: MetricDefinition;
  /** Current series count for the metric */
  seriesCount: SeriesCount;
  /** Threshold where cardinality is considered high */
  thresholdHigh: SeriesCount;
  /** Close drawer callback */
  onClose: () => void;
}

/**
 * Header area displayed at the top of the DataPointInspectorDrawer.
 *
 * Visual elements include:
 * - `CRingSvg` surrounding the instrument badge to indicate cardinality
 * - Metric name and unit with truncation/tooltip
 * - Optional description line also truncated
 * - A close button with `aria-label` for screen readers
 */
export const InspectorHeader: React.FC<InspectorHeaderProps> = ({
  metricDefinition,
  seriesCount,
  thresholdHigh,
  onClose,
}) => {
  const { name, description, instrumentType, unit } = metricDefinition;

  return (
    <div className={styles.header}>
      <div className={styles.badgeContainer}>
        <CRingSvg
          seriesCount={seriesCount}
          thresholdHigh={thresholdHigh}
          diameter={32}
          strokeWidth={3}
          animated
        />
        <InstrumentBadge type={instrumentType} className={styles.badge} />
      </div>

      <div className={styles.textContainer}>
        <h2 className={styles.title} title={name}>
          {name}
          {unit && <span className={styles.unit}> ({unit})</span>}
        </h2>
        {description && (
          <p className={styles.description} title={description}>
            {description}
          </p>
        )}
      </div>

      <button
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close inspector"
      >
        ×
      </button>
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { ExemplarData } from '@/contracts/types';
import { formatters, formatTimestamp } from '@/utils/formatters';
import { CopyButton } from '@/ui/atoms/CopyButton';
import styles from './ExemplarsZone.module.css';

/**
 * Timeline visualization of exemplars associated with a data point.
 *
 * @remarks
 * Algorithm summary:
 * 1. Sort exemplars by timestamp (`timeUnixNano`).
 * 2. Derive the minimum and maximum timestamps to compute the span of the
 *    timeline. If there is only one exemplar the axis is hidden.
 * 3. Map each exemplar timestamp to a percentage position on the axis.
 * 4. Clicking a dot selects the exemplar and shows its details panel.
 * 5. The panel displays timestamp, numeric value, attributes and optional
 *    trace/span IDs with a "View Trace" action.
 *
 * Test scenarios derived from the specification:
 * - No exemplars → renders an empty state message.
 * - Single exemplar → dot appears centered without tick marks.
 * - Multiple exemplars → dots rendered across timeline based on timestamp.
 * - Selecting an exemplar → details panel with trace links shown.
 * - Exemplar without traceId → trace section omitted.
 * - Clicking "View Trace" → invokes `onExemplarClick` with the exemplar.
 */
export interface ExemplarsZoneProps {
  /** Array of exemplar data objects */
  exemplars: ExemplarData[];

  /** Optional callback when exemplar is clicked */
  onExemplarClick?: (exemplar: ExemplarData) => void;
}

export const ExemplarsZone: React.FC<ExemplarsZoneProps> = ({
  exemplars,
  onExemplarClick
}) => {
  const [selectedExemplar, setSelectedExemplar] = useState<ExemplarData | null>(null);

  const sortedExemplars = useMemo(() => {
    return [...exemplars].sort((a, b) => a.timeUnixNano - b.timeUnixNano);
  }, [exemplars]);

  const timeRange = useMemo(() => {
    if (sortedExemplars.length < 2) return null;

    const minTime = sortedExemplars[0].timeUnixNano;
    const maxTime = sortedExemplars[sortedExemplars.length - 1].timeUnixNano;
    return { minTime, maxTime, span: maxTime - minTime };
  }, [sortedExemplars]);

  const handleExemplarSelect = (exemplar: ExemplarData) => {
    setSelectedExemplar(exemplar);
    if (onExemplarClick) {
      onExemplarClick(exemplar);
    }
  };

  const getPositionPercent = (timestamp: number) => {
    if (!timeRange || timeRange.span === 0) return 0;
    return ((timestamp - timeRange.minTime) / timeRange.span) * 100;
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>EXEMPLARS ({exemplars.length})</h3>

      {exemplars.length > 0 && timeRange && (
        <div className={styles.timeline}>
          <div className={styles.dots}>
            {sortedExemplars.map((exemplar, index) => {
              const position = getPositionPercent(exemplar.timeUnixNano);
              const isSelected = selectedExemplar === exemplar;

              return (
                <div
                  key={`${exemplar.timeUnixNano}-${index}`}
                  className={`${styles.dot} ${isSelected ? styles.selected : ''}`}
                  style={{ left: `${position}%` }}
                  onClick={() => handleExemplarSelect(exemplar)}
                  title={`Value: ${exemplar.value}, Time: ${formatTimestamp(exemplar.timeUnixNano)}`}
                />
              );
            })}
          </div>

          <div className={styles.axis}>
            <div className={styles.line} />
            <div className={styles.tickMarks}>
              {[0, 25, 50, 75, 100].map(position => (
                <div
                  key={position}
                  className={styles.tick}
                  style={{ left: `${position}%` }}
                >
                  <span className={styles.tickLabel}>
                    {formatTimestamp(timeRange.minTime + (timeRange.span * (position / 100)))}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedExemplar && (
        <div className={styles.details}>
          <div className={styles.header}>
            <div className={styles.timestamp}>
              {formatTimestamp(selectedExemplar.timeUnixNano, true)}
            </div>
            <div className={styles.value}>
              value: {formatters.int(selectedExemplar.value)}
            </div>
          </div>

          {selectedExemplar.traceId && (
            <div className={styles.traceInfo}>
              <div className={styles.traceId}>
                Trace ID: {selectedExemplar.traceId.substring(0, 10)}...
                <CopyButton
                  copyValue={selectedExemplar.traceId}
                  ariaLabel="Copy trace ID"
                />
              </div>

              {selectedExemplar.spanId && (
                <div className={styles.spanId}>
                  Span ID: {selectedExemplar.spanId}
                  <CopyButton
                    copyValue={selectedExemplar.spanId}
                    ariaLabel="Copy span ID"
                  />
                </div>
              )}

              {onExemplarClick && (
                <button
                  className={styles.viewTraceButton}
                  onClick={() => onExemplarClick(selectedExemplar)}
                  aria-label="View trace details"
                >
                  View Trace
                </button>
              )}
            </div>
          )}

          {Object.keys(selectedExemplar.attributes).length > 0 && (
            <div className={styles.attributes}>
              <h4 className={styles.attributesTitle}>ATTRIBUTES:</h4>
              <div className={styles.attributesList}>
                {Object.entries(selectedExemplar.attributes).map(([key, value]) => (
                  <div key={key} className={styles.attributeRow}>
                    <span className={styles.attributeKey}>{key}:</span>
                    <span className={styles.attributeValue}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {exemplars.length === 0 && (
        <div className={styles.empty}>
          No exemplars available for this data point.
        </div>
      )}
    </div>
  );
};



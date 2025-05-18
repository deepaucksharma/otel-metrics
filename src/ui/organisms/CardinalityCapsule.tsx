/**
 * Visual control center for cardinality understanding and simulation.
 *
 * This organism renders the metric series count, contributor bars and a
 * drop-simulation toggle. Parent components control which attribute is
 * focused and pass updated series counts when a drop simulation is active.
 *
 * Consumers: DataPointInspectorDrawer.
 */
import React, { useState, useCallback } from 'react';
import styles from './CardinalityCapsule.module.css';
import { CRingSvg } from '@/ui/atoms/CRingSvg';
import { SeriesMathChip } from '@/ui/atoms/SeriesMathChip';
import { MiniBar } from '@/ui/atoms/MiniBar';
import { InstrumentBadge } from '@/ui/atoms/InstrumentBadge';

/**
 * Props for {@link CardinalityCapsule}.
 */
export interface CardinalityCapsuleProps {
  /** Current series count for the metric. */
  seriesCount: number;
  /** Threshold where cardinality is considered high. */
  thresholdHigh: number;
  /** Ordered list of attribute keys by impact on cardinality. */
  attrRank: string[];
  /** Map of attribute keys to their unique value counts. */
  attrUniq: Record<string, number>;
  /** Currently focused attribute or null. */
  focusedAttrKey: string | null;
  /** Callback to focus an attribute or clear focus. */
  onFocusAttr: (key: string | null) => void;
  /** Callback to toggle drop simulation. */
  onToggleDrop: (attrKey: string, nextState: boolean) => void;
  /** Whether drop simulation is active. */
  isDropSimActive: boolean;
  /** Attribute key currently being simulated as dropped, if any. */
  droppedKey: string | null;
}

/**
 * Renders a cardinality overview with optional attribute drop simulation.
 *
 * Internal state: `showSimulation` mirrors the checkbox for toggling the drop
 * simulation. The component slices the provided `attrRank` to show only the top
 * three attributes in the contributor list. When the checkbox changes, it calls
 * `onToggleDrop` with the focused attribute key and next state.
 */
export const CardinalityCapsule: React.FC<CardinalityCapsuleProps> = ({
  seriesCount,
  thresholdHigh,
  attrRank,
  attrUniq,
  focusedAttrKey,
  onFocusAttr,
  onToggleDrop,
  isDropSimActive,
  droppedKey,
}) => {
  // Local state for the simulation checkbox
  const [showSimulation, setShowSimulation] = useState(isDropSimActive);

  // Show only the top three attributes
  const topAttributes = attrRank.slice(0, 3);

  // Toggle handler for the simulation checkbox
  const handleToggleSimulation = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const checked = e.target.checked;
      setShowSimulation(checked);
      if (focusedAttrKey) {
        onToggleDrop(focusedAttrKey, checked);
      }
    },
    [focusedAttrKey, onToggleDrop],
  );

  // Calculate reduction percentage when simulation is active
  const reductionPct =
    isDropSimActive && droppedKey && attrUniq[droppedKey]
      ? Math.round(
          (1 - seriesCount / (seriesCount * attrUniq[droppedKey])) * 100,
        )
      : 0;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.ringContainer}>
          <CRingSvg
            seriesCount={seriesCount}
            thresholdHigh={thresholdHigh}
            diameter={36}
          />
          <InstrumentBadge type="Gauge" size="small" />
        </div>
        <div className={styles.seriesCount}>
          <span className={styles.count}>{seriesCount}</span> SERIES
        </div>
      </div>

      <SeriesMathChip
        attrKeys={attrRank}
        attrUniq={attrUniq}
        seriesCount={seriesCount}
        highlightKey={focusedAttrKey}
        className={styles.mathChip}
      />

      <div className={styles.contributorsSection}>
        <h4 className={styles.sectionTitle}>TOP CONTRIBUTORS TO CARDINALITY</h4>
        <div className={styles.miniBars}>
          {topAttributes.map((attr) => (
            <div
              key={attr}
              className={`${styles.miniBarRow} ${
                focusedAttrKey === attr ? styles.focused : ''
              }`}
              onClick={() => onFocusAttr(focusedAttrKey === attr ? null : attr)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onFocusAttr(focusedAttrKey === attr ? null : attr);
                }
              }}
            >
              <div className={styles.attrName}>{attr}</div>
              <div className={styles.barContainer}>
                <MiniBar
                  value={attrUniq[attr]}
                  max={attrUniq[topAttributes[0]]}
                />
                <span className={styles.barValue}>{attrUniq[attr]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {focusedAttrKey && (
        <div className={styles.simulationSection}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showSimulation}
              onChange={handleToggleSimulation}
              className={styles.checkbox}
            />
            Simulate drop: <span className={styles.focusedAttr}>{focusedAttrKey}</span>
          </label>

          {isDropSimActive && droppedKey && (
            <div className={styles.simulationResult}>
              → <strong>{seriesCount}</strong> series (<strong>{reductionPct}%</strong> less)
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type { InspectorProps } from '@/contracts/types';
import { InspectorHeader } from './InspectorHeader';
import { ValueZone } from './ValueZone';
import { CardinalityCapsule } from './CardinalityCapsule';
import { AttributeZone } from './AttributeZone';
import { ExemplarsZone } from './ExemplarsZone';
import { RawJsonZone } from './RawJsonZone';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import styles from './DataPointInspectorDrawer.module.css';

/**
 * Main slide-in drawer showing all facets of a single metric data point.
 *
 * This component combines several organisms to present metric metadata,
 * attribute analysis, exemplar information and raw JSON in a single view.
 *
 * ## Child Components
 * - {@link InspectorHeader} fixed at the top with metric definition and close button.
 * - {@link ValueZone} visualises the data point value.
 * - {@link CardinalityCapsule} displays cardinality insights and drop simulation controls.
 * - {@link AttributeZone} lists resource and metric attributes.
 * - {@link ExemplarsZone} shows trace exemplars when provided.
 * - {@link RawJsonZone} renders a collapsible JSON representation of the point.
 *
 * ## Event Flow
 * 1. Attribute clicks in AttributeZone or CardinalityCapsule update `focusedAttrKey`.
 * 2. Drop simulation toggle triggers `handleToggleDrop` which updates local state
 *    and forwards the event via `onSimulateDrop`.
 * 3. The header close button or pressing ESC invokes `onClose` to hide the drawer.
 *
 * ## Accessibility
 * - Container receives focus when opened and traps keyboard focus while mounted.
 * - Keyboard ESC closes the drawer.
 * - ARIA labels are applied to interactive elements via child components.
 */
export interface DataPointInspectorDrawerProps extends InspectorProps {
  /** Optional classname for drawer container */
  className?: string;
  /** Whether to show drawer on the right (default) or left */
  positionRight?: boolean;
}

export const DataPointInspectorDrawer: React.FC<DataPointInspectorDrawerProps> = ({
  metricName,
  seriesKey,
  point,
  resourceAttrs,
  metricAttrs,
  metricDefinition,
  cardinality,
  exemplars,
  onClose,
  onAddGlobalFilter,
  onSimulateDrop,
  metricLatestNValues,
  className,
  positionRight = true,
}) => {
  const [focusedAttrKey, setFocusedAttrKey] = useState<string | null>(null);
  const [droppedKey, setDroppedKey] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const handleToggleDrop = useCallback(
    (attrKey: string, nextState: boolean) => {
      if (onSimulateDrop) {
        onSimulateDrop(attrKey, nextState);
      }
      setDroppedKey(nextState ? attrKey : null);
    },
    [onSimulateDrop]
  );

  // Close on ESC key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Trap focus inside drawer while mounted
  useFocusTrap(drawerRef);

  const memoizedAttributeZone = useMemo(
    () => (
      <AttributeZone
        resourceAttrs={resourceAttrs}
        metricAttrs={metricAttrs}
        attrUniq={cardinality.attrUniq}
        seriesCount={cardinality.seriesCount}
        focusedAttrKey={focusedAttrKey}
        onFocusAttr={setFocusedAttrKey}
        onAddGlobalFilter={onAddGlobalFilter}
      />
    ),
    [
      resourceAttrs,
      metricAttrs,
      cardinality.attrUniq,
      cardinality.seriesCount,
      focusedAttrKey,
      onAddGlobalFilter,
    ]
  );

  const containerClasses = [
    styles.drawerContainer,
    positionRight ? styles.positionRight : styles.positionLeft,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      ref={drawerRef}
      tabIndex={-1}
      aria-modal="true"
      role="dialog"
    >
      <InspectorHeader
        metricDefinition={metricDefinition}
        seriesCount={cardinality.seriesCount}
        thresholdHigh={cardinality.thresholdHigh}
        onClose={onClose}
      />

      <div className={styles.content}>
        <ValueZone
          point={point}
          metricDefinition={metricDefinition}
          latestValues={metricLatestNValues}
        />

        <CardinalityCapsule
          seriesCount={cardinality.seriesCount}
          thresholdHigh={cardinality.thresholdHigh}
          attrRank={cardinality.attrRank}
          attrUniq={cardinality.attrUniq}
          focusedAttrKey={focusedAttrKey}
          onFocusAttr={setFocusedAttrKey}
          onToggleDrop={handleToggleDrop}
          isDropSimActive={!!droppedKey}
          droppedKey={droppedKey}
        />

        {memoizedAttributeZone}

        {exemplars && exemplars.length > 0 && (
          <ExemplarsZone exemplars={exemplars} />
        )}

        <RawJsonZone
          metricName={metricName}
          point={point}
          resourceAttrs={resourceAttrs}
          metricAttrs={metricAttrs}
          initialCollapsed={true}
        />
      </div>
    </div>
  );
};


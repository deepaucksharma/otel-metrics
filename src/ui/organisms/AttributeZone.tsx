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

import React, { useState, useCallback } from 'react';
import type { AttrMap, AttrValue } from '@/contracts/types';
import { FixedSizeList } from 'react-window';
import styles from './AttributeZone.module.css';

/**
 * Structured grid of attribute key-value pairs with cardinality indicators.
 *
 * Rendering:
 * - Header shows total attribute count.
 * - Resource and metric sections are shown when each has data.
 * - Rows are rendered via {@link AttributeRow} and virtualized when metric attributes exceed 50 keys.
 *
 * Consumers:
 * - {@link DataPointInspectorDrawer} passes attribute data and handles focus state.
 */
export interface AttributeZoneProps {
  /** Resource-level attributes (from resource object) */
  resourceAttrs: AttrMap;

  /** Metric-level attributes (from data point) */
  metricAttrs: AttrMap;

  /** Map of attribute keys to unique-value counts */
  attrUniq: Record<string, number>;

  /** Total series count for calculating percentages */
  seriesCount: number;

  /** Currently focused attribute key (or null) */
  focusedAttrKey: string | null;

  /** Callback when attribute focus changes */
  onFocusAttr: (key: string | null) => void;

  /** Optional callback to add global filter for attribute */
  onAddGlobalFilter?: (key: string, value: AttrValue) => void;
}

interface AttributeRowProps {
  attrKey: string;
  attrValue: AttrValue;
  uniqueCount: number;
  isFocused: boolean;
  onFocus: () => void;
  onClear: () => void;
  onCopy: () => void;
  onAddFilter?: () => void;
  style?: React.CSSProperties;
}

const AttributeRow: React.FC<AttributeRowProps> = ({
  attrKey,
  attrValue,
  uniqueCount,
  isFocused,
  onFocus,
  onClear,
  onCopy,
  onAddFilter,
  style
}) => {
  const handleClick = () => {
    isFocused ? onClear() : onFocus();
  };
  return (
    <div
      className={isFocused ? styles.rowFocused : undefined}
      style={style}
      onClick={handleClick}
    >
      <div className={styles.key}>{attrKey}</div>
      <div className={styles.value}>{String(attrValue)}</div>
      <div className={styles.actions}>
        <span className={styles.rarityDot} aria-label={`unique values: ${uniqueCount}`}>
          {uniqueCount}
        </span>
        <button onClick={onCopy}>Copy</button>
        {onAddFilter && <button onClick={onAddFilter}>Filter</button>}
      </div>
    </div>
  );
};

/**
 * Display resource and metric attributes in a grid with rarity indicators.
 */
export const AttributeZone: React.FC<AttributeZoneProps> = ({
  resourceAttrs,
  metricAttrs,
  attrUniq,
  seriesCount,
  focusedAttrKey,
  onFocusAttr,
  onAddGlobalFilter
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = useCallback((key: string, value: AttrValue) => {
    navigator.clipboard.writeText(String(value));
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  const renderRow = useCallback(
    (key: string, value: AttrValue) => (
      <AttributeRow
        key={key}
        attrKey={key}
        attrValue={value}
        uniqueCount={attrUniq[key] ?? 0}
        isFocused={focusedAttrKey === key}
        onFocus={() => onFocusAttr(key)}
        onClear={() => onFocusAttr(null)}
        onCopy={() => handleCopy(key, value)}
        onAddFilter={onAddGlobalFilter ? () => onAddGlobalFilter(key, value) : undefined}
      />
    ),
    [attrUniq, focusedAttrKey, handleCopy, onAddGlobalFilter, onFocusAttr]
  );

  const metricKeys = Object.keys(metricAttrs);
  const resourceKeys = Object.keys(resourceAttrs);
  const totalAttrCount = metricKeys.length + resourceKeys.length;

  if (metricKeys.length > 50) {
    return (
      <div className={styles.container}>
        <h3>ATTRIBUTES ({totalAttrCount})</h3>
        {resourceKeys.length > 0 && (
          <>
            <h4>Resource ({resourceKeys.length})</h4>
            <div className={styles.grid}>{resourceKeys.map(k => renderRow(k, resourceAttrs[k]))}</div>
          </>
        )}
        <h4>Metric ({metricKeys.length})</h4>
        <FixedSizeList height={300} width="100%" itemCount={metricKeys.length} itemSize={36}>
          {({ index, style }) => {
            const key = metricKeys[index];
            return (
              <AttributeRow
                style={style}
                attrKey={key}
                attrValue={metricAttrs[key]}
                uniqueCount={attrUniq[key] ?? 0}
                isFocused={focusedAttrKey === key}
                onFocus={() => onFocusAttr(key)}
                onClear={() => onFocusAttr(null)}
                onCopy={() => handleCopy(key, metricAttrs[key])}
                onAddFilter={onAddGlobalFilter ? () => onAddGlobalFilter(key, metricAttrs[key]) : undefined}
              />
            );
          }}
        </FixedSizeList>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3>ATTRIBUTES ({totalAttrCount})</h3>
      {resourceKeys.length > 0 && (
        <>
          <h4>Resource ({resourceKeys.length})</h4>
          <div className={styles.grid}>{resourceKeys.map(k => renderRow(k, resourceAttrs[k]))}</div>
        </>
      )}
      {metricKeys.length > 0 && (
        <>
          <h4>Metric ({metricKeys.length})</h4>
          <div className={styles.grid}>{metricKeys.map(k => renderRow(k, metricAttrs[k]))}</div>
        </>
      )}
    </div>
  );
};


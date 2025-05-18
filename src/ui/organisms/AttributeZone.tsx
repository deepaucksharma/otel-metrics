import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AttrMap, AttrValue } from '@/contracts/types';
import { FixedSizeList } from 'react-window';
import { AttributeRow } from '../molecules/AttributeRow';
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
  const rowRef = useRef<HTMLDivElement>(null);
  const [itemSize, setItemSize] = useState<number>(36);

  useEffect(() => {
    if (rowRef.current) {
      setItemSize(rowRef.current.getBoundingClientRect().height);
    }
  }, []);
  const renderRow = useCallback(
    (
      key: string,
      value: AttrValue,
      style?: React.CSSProperties,
      ref?: React.Ref<HTMLDivElement>
    ) => {
      const uniqueCount = attrUniq[key] ?? 0;
      const rarityPercent = seriesCount ? (uniqueCount / seriesCount) * 100 : 0;
      const handleClick = () =>
        focusedAttrKey === key ? onFocusAttr(null) : onFocusAttr(key);
      return (
        <div ref={ref} style={style} onClick={handleClick}>
          <AttributeRow
            attrKey={key}
            attrValue={value}
            rarityPercent={rarityPercent}
            isFocused={focusedAttrKey === key}
            onAddGlobalFilter={
              onAddGlobalFilter ? () => onAddGlobalFilter(key, value) : undefined
            }
          />
        </div>
      );
    },
    [attrUniq, seriesCount, focusedAttrKey, onAddGlobalFilter, onFocusAttr]
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
        <FixedSizeList height={300} width="100%" itemCount={metricKeys.length} itemSize={itemSize}>
          {({ index, style }) => {
            const key = metricKeys[index];
            return renderRow(key, metricAttrs[key], style, index === 0 ? rowRef : undefined);
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


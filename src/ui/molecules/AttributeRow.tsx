import React, { useState } from 'react';
import clsx from 'clsx';
import { Filter } from 'lucide-react';
import { RarityDot } from '../atoms/RarityDot';
import { CopyButton } from '../atoms/CopyButton';
import styles from './AttributeRow.module.css';

/**
 * Display one attribute key/value pair with rarity indicators and copy actions.
 *
 * Each row shows the attribute name, value, and a {@link RarityDot} visualising
 * how common the value is. A {@link CopyButton} copies the pair to clipboard.
 * When focused, a checkbox appears allowing the user to simulate dropping the
 * attribute via the {@link onSimulateDrop} callback. Optionally a filter button
 * can call {@link onAddGlobalFilter}.
 *
 * @remarks
 * Jest tests should ensure the copy button triggers clipboard writes and the
 * checkbox invokes {@link onSimulateDrop}. Storybook stories visualise different
 * rarity levels and the focused state.
 */
export interface AttributeRowProps {
  /** Attribute key */
  attrKey: string;
  /** Primitive value of the attribute */
  attrValue: string | number | boolean;
  /** Percentage of series containing this value */
  rarityPercent: number;
  /** Whether the row is currently focused/highlighted */
  isFocused?: boolean;
  /** Rank position in overall attribute list */
  rank?: number;
  /** Absolute unique value count for this attribute */
  uniqueCount?: number;
  /** Click handler used by parent components to control focus */
  onClick?: () => void;
  /** Callback to toggle drop simulation */
  onSimulateDrop?: (key: string, drop: boolean) => void;
  /** Add key=value as a global filter */
  onAddGlobalFilter?: (key: string, value: string | number | boolean) => void;
  /** Optional style when used inside virtualization lists */
  style?: React.CSSProperties;
}

/**
 * Renders a single attribute row.
 */
export const AttributeRow: React.FC<AttributeRowProps> = ({
  attrKey,
  attrValue,
  rarityPercent,
  isFocused = false,
  rank,
  uniqueCount,
  onClick,
  onSimulateDrop,
  onAddGlobalFilter,
  style,
}) => {
  const [dropChecked, setDropChecked] = useState(false);

  const handleDropChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setDropChecked(checked);
    onSimulateDrop?.(attrKey, checked);
  };

  const handleAddFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddGlobalFilter?.(attrKey, attrValue);
  };

  return (
    <div
      className={clsx(styles.row, isFocused && styles.focused)}
      tabIndex={0}
      style={style}
      onClick={onClick}
    >
      <RarityDot rarityPercent={rarityPercent} ariaLabel={`unique values: ${uniqueCount ?? 'N/A'}`} />
      {rank !== undefined && <span className={styles.rank}>{rank}</span>}
      <span className={styles.key}>{attrKey}</span>
      <span className={styles.value}>{String(attrValue)}</span>
      {isFocused && onSimulateDrop && (
        <label className={styles.drop} onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={dropChecked}
            onChange={handleDropChange}
          />
          drop
        </label>
      )}
      <div className={styles.actions} onClick={(e) => e.stopPropagation()}>
        {uniqueCount !== undefined && (
          <span className={styles.count} aria-label={`unique values: ${uniqueCount}`}>{uniqueCount}</span>
        )}
        {onAddGlobalFilter && (
          <button
            type="button"
            className={styles.filter}
            onClick={handleAddFilter}
            aria-label="Add global filter"
          >
            <Filter size={14} strokeWidth={1.5} />
          </button>
        )}
        <CopyButton
          copyValue={`${attrKey}=${attrValue}`}
          className={styles.copy}
        />
      </div>
    </div>
  );
};


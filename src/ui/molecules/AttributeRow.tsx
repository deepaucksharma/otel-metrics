import React from 'react';
import { CopyButton } from '../atoms/CopyButton';
import { RarityDot } from '../atoms/RarityDot';
import styles from './AttributeRow.module.css';
import type { AttrValue } from '@/contracts/types';

export interface AttributeRowProps {
  attrKey: string;
  attrValue: AttrValue;
  rarityPercent: number;
  isFocused?: boolean;
  onAddGlobalFilter?: () => void;
  className?: string;
}

export const AttributeRow: React.FC<AttributeRowProps> = ({
  attrKey,
  attrValue,
  rarityPercent,
  isFocused = false,
  onAddGlobalFilter,
  className,
}) => {
  return (
    <div
      className={`${styles.attributeRow} ${isFocused ? styles.attributeRowFocused : ''} ${
        className || ''
      }`}
      data-testid="attribute-row"
    >
      <div className={styles.key}>{attrKey}</div>
      <div className={styles.value}>{String(attrValue)}</div>
      <div className={styles.actions}>
        <RarityDot rarityPercent={rarityPercent} />
        <CopyButton
          copyValue={String(attrValue)}
          ariaLabel={`Copy value: ${String(attrValue)}`}
        />
        {onAddGlobalFilter && (
          <button onClick={onAddGlobalFilter} data-testid="filter-button">
            Filter
          </button>
        )}
      </div>
    </div>
  );
};

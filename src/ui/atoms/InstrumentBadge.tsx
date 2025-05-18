import React from 'react';
import clsx from 'clsx';
import styles from './InstrumentBadge.module.css';
import type { MetricDefinition } from '@/contracts/types';

export interface InstrumentBadgeProps {
  type: MetricDefinition['instrumentType'];
  size?: 'small' | 'large';
  className?: string;
}

export const InstrumentBadge: React.FC<InstrumentBadgeProps> = ({
  type,
  size = 'large',
  className,
}) => {
  const sizeClass = size === 'small' ? styles.small : styles.large;
  return (
    <span className={clsx(styles.badge, sizeClass, className)}>{type}</span>
  );
};

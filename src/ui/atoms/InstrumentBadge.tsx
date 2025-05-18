import React from 'react';
import clsx from 'clsx';
import {
  GaugeCircle,
  Plus,
  BarChart2,
  List,
  HelpCircle,
} from 'lucide-react';
import styles from './InstrumentBadge.module.css';
import type { MetricDefinition } from '@/contracts/types';

/**
 * Props for {@link InstrumentBadge}.
 *
 * @property type - Metric instrument type used to choose icon and colour.
 * @property size - Badge dimensions, `'small'` or `'large'` (default).
 * @property className - Optional extra class for the badge element.
 */
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
  const iconSize = size === 'small' ? 12 : 16;

  const Icon =
    type === 'Gauge'
      ? GaugeCircle
      : type === 'Sum'
      ? Plus
      : type === 'Histogram'
      ? BarChart2
      : type === 'Summary'
      ? List
      : HelpCircle;

  const typeClass =
    type === 'Gauge'
      ? styles.gauge
      : type === 'Sum'
      ? styles.sum
      : type === 'Histogram'
      ? styles.histogram
      : type === 'Summary'
      ? styles.summary
      : styles.unknown;

  return (
    <span
      className={clsx(styles.badge, typeClass, sizeClass, className)}
      aria-label={type}
    >
      <Icon size={iconSize} aria-hidden />
    </span>
  );
};

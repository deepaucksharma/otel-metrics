/**
 * @file InstrumentBadge.tsx
 * @summary Displays an icon for a metric instrument type.
 * @remarks
 * ### Purpose
 * Provide a consistent visual indicator for each instrument type.
 *
 * ### Public API
 * - `InstrumentBadge` React component
 * - `InstrumentBadgeProps` interface
 *
 * ### Usage
 * ```tsx
 * <InstrumentBadge type="Gauge" size="small" />
 * ```
 *
 * @layer UI-Atom
 */
import React from 'react';
import clsx from 'clsx';
import { Gauge, Sigma, BarChart2, List, HelpCircle } from 'lucide-react';
import type { MetricDefinition } from '@intellimetric/contracts/types';
import styles from './InstrumentBadge.module.css';

export interface InstrumentBadgeProps {
  type: MetricDefinition['instrumentType'];
  size?: 'small' | 'large';
  className?: string;
}

const icons: Record<MetricDefinition['instrumentType'], React.ElementType> = {
  Gauge,
  Sum: Sigma,
  Histogram: BarChart2,
  Summary: List,
  Unknown: HelpCircle,
};

export const InstrumentBadge: React.FC<InstrumentBadgeProps> = ({
  type,
  size = 'large',
  className,
}) => {
  const Icon = icons[type] ?? HelpCircle;
  const pixel = size === 'small' ? 16 : 24;

  return (
    <span
      role="img"
      aria-label={`${type} instrument`}
      className={clsx(styles.badge, styles[size], className)}
    >
      <Icon size={pixel} strokeWidth={1.8} />
    </span>
  );
};
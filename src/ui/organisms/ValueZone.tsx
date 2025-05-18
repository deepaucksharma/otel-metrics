import React from 'react';
import type { ParsedPoint, MetricDefinition } from '@intellimetric/contracts/types';
import { GaugeCard } from '@/ui/atoms/GaugeCard';
import { CounterCard } from '@/ui/atoms/CounterCard';
import { HistogramMiniChart } from '@/ui/atoms/HistogramMiniChart';

/**
 * Numeric value display inside the Data-Point Inspector.
 *
 * Renders different visualization components based on the metric type:
 * - GaugeCard for gauges and non-monotonic sums
 * - CounterCard for monotonic sums
 * - HistogramMiniChart for histograms
 */
export interface ValueZoneProps {
  /** Data point being inspected. */
  point: ParsedPoint;
  /** Metric metadata used to decide display style. */
  metricDefinition: MetricDefinition;
}

export const ValueZone: React.FC<ValueZoneProps> = ({ point, metricDefinition }) => {
  switch (metricDefinition.instrumentType) {
    case 'Gauge':
      return (
        <GaugeCard value={(point as any).value} unit={metricDefinition.unit} />
      );
    case 'Sum':
      if (!metricDefinition.isMonotonic) {
        return (
          <GaugeCard value={(point as any).value} unit={metricDefinition.unit} />
        );
      }
      return (
        <CounterCard value={(point as any).value} unit={metricDefinition.unit} />
      );
    case 'Histogram':
      return (
        <HistogramMiniChart
          buckets={(point as any).bucketCounts}
          bounds={(point as any).explicitBounds}
        />
      );
    default:
      return null;
  }
};

export default ValueZone;

import type {
  RawOtlpMetric,
  RawOtlpNumberDataPoint,
  RawOtlpHistogramDataPoint,
} from '@intellimetric/contracts/rawOtlpTypes';
import type { MetricDefinition } from '@intellimetric/contracts/types';
import { mapTemporality } from './mappingUtils';

export interface MetricInfo {
  definition: MetricDefinition;
  points: Array<RawOtlpNumberDataPoint | RawOtlpHistogramDataPoint>;
}

/** Determine metric definition and associated points from raw OTLP metric. */
export function deriveMetric(m: RawOtlpMetric): MetricInfo {
  if (m.gauge?.dataPoints) {
    return {
      definition: {
        name: m.name,
        description: m.description,
        unit: m.unit,
        instrumentType: 'Gauge',
        temporality: 'Unspecified',
      },
      points: m.gauge.dataPoints as RawOtlpNumberDataPoint[],
    };
  }

  if (m.sum?.dataPoints) {
    return {
      definition: {
        name: m.name,
        description: m.description,
        unit: m.unit,
        instrumentType: 'Sum',
        temporality: mapTemporality(m.sum.aggregationTemporality),
        isMonotonic: m.sum.isMonotonic,
      },
      points: m.sum.dataPoints as RawOtlpNumberDataPoint[],
    };
  }

  if (m.histogram?.dataPoints) {
    return {
      definition: {
        name: m.name,
        description: m.description,
        unit: m.unit,
        instrumentType: 'Histogram',
        temporality: mapTemporality(m.histogram.aggregationTemporality),
      },
      points: m.histogram.dataPoints as RawOtlpHistogramDataPoint[],
    };
  }

  return {
    definition: {
      name: m.name,
      description: m.description,
      unit: m.unit,
      instrumentType: 'Unknown',
    },
    points: [],
  };
}

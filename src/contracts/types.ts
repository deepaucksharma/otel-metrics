export interface MetricDefinition {
  name: string;
  description?: string;
  unit?: string;
  instrumentType: 'Gauge' | 'Sum' | 'Histogram' | 'Summary' | 'Unknown';
  temporality?: 'Delta' | 'Cumulative' | 'Unspecified';
  isMonotonic?: boolean;
}

export interface NumberDataPoint {
  value: number;
}

export interface HistogramDataPoint {
  bucketCounts: number[];
  explicitBounds: number[];
}

export type ParsedPoint = NumberDataPoint | HistogramDataPoint;

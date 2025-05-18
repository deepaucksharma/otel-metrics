import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ValueZone } from '../src/ui/organisms/ValueZone';
import type { MetricDefinition, ParsedPoint } from '../src/contracts/types';

describe('ValueZone', () => {
  it('renders GaugeCard for Gauge metric', () => {
    const metric: MetricDefinition = { name: 'g', instrumentType: 'Gauge' };
    const point: ParsedPoint = { value: 5 } as ParsedPoint;
    render(<ValueZone point={point} metricDefinition={metric} />);
    expect(screen.getByTestId('gauge-card')).toBeInTheDocument();
  });

  it('renders CounterCard for monotonic Sum', () => {
    const metric: MetricDefinition = { name: 'c', instrumentType: 'Sum', isMonotonic: true };
    const point: ParsedPoint = { value: 10 } as ParsedPoint;
    render(<ValueZone point={point} metricDefinition={metric} />);
    expect(screen.getByTestId('counter-card')).toBeInTheDocument();
  });

  it('renders HistogramMiniChart for Histogram', () => {
    const metric: MetricDefinition = { name: 'h', instrumentType: 'Histogram' };
    const point: ParsedPoint = {
      bucketCounts: [1,2],
      explicitBounds: [0,1]
    } as ParsedPoint;
    render(<ValueZone point={point} metricDefinition={metric} />);
    expect(screen.getByTestId('histogram-chart')).toBeInTheDocument();
  });
});

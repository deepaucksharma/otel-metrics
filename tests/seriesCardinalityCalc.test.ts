import { describe, it, expect } from 'vitest';
import { getActualSeriesCount, simulateDroppedAttributesSeriesCount } from '../src/logic/processing/seriesCardinalityCalc';
import type { ParsedMetricData, ParsedSeriesData } from '../src/contracts/types';

function makeSeries(key: string, res: Record<string,string>, met: Record<string,string>): ParsedSeriesData {
  return { seriesKey: key, resourceAttributes: res, metricAttributes: met, points: [] };
}

function makeMetric(series: ParsedSeriesData[]): ParsedMetricData {
  const map = new Map(series.map(s => [s.seriesKey, s]));
  return { definition: { name: 'metric', instrumentType: 'Gauge' }, seriesData: map };
}

describe('series cardinality calc', () => {
  const metric = makeMetric([
    makeSeries('k1', { host: 'a' }, { status: '200' }),
    makeSeries('k2', { host: 'b' }, { status: '500' }),
  ]);

  it('gets actual series count', () => {
    expect(getActualSeriesCount(metric)).toBe(2);
  });

  it('no keys dropped equals actual', () => {
    expect(simulateDroppedAttributesSeriesCount(metric, [])).toBe(2);
  });

  it('dropping unique attr collapses count', () => {
    expect(simulateDroppedAttributesSeriesCount(metric, ['host','status'])).toBe(1);
  });

  it('dropping missing attr leaves count', () => {
    expect(simulateDroppedAttributesSeriesCount(metric, ['none'])).toBe(2);
  });
});

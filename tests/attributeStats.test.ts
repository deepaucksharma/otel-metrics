import { describe, it, expect } from 'vitest';
import { calculateAttributeStatsForMetric } from '../src/logic/processing/attributeStats';
import type { ParsedMetricData, ParsedSeriesData } from '../src/contracts/types';

function makeSeries(key: string, res: Record<string,string>, met: Record<string,string>): ParsedSeriesData {
  return { seriesKey: key, resourceAttributes: res, metricAttributes: met, points: [] };
}

function makeMetric(series: ParsedSeriesData[]): ParsedMetricData {
  const map = new Map(series.map(s => [s.seriesKey, s]));
  return { definition: { name: 'm', instrumentType: 'Gauge' }, seriesData: map };
}

describe('calculateAttributeStatsForMetric', () => {
  it('computes unique counts and rank', () => {
    const metric = makeMetric([
      makeSeries('s1', { 'host.name': 'a' }, { 'http.method': 'GET', 'k8s.pod': 'p1' }),
      makeSeries('s2', { 'host.name': 'a' }, { 'http.method': 'POST', 'k8s.pod': 'p2' }),
      makeSeries('s3', { 'host.name': 'a' }, { 'http.method': 'GET', 'k8s.pod': 'p3' }),
    ]);
    const stats = calculateAttributeStatsForMetric(metric);
    expect(stats.attrUniq['host.name']).toBe(1);
    expect(stats.attrUniq['http.method']).toBe(2);
    expect(stats.attrUniq['k8s.pod']).toBe(3);
    expect(stats.attrRank).toEqual(['k8s.pod', 'http.method', 'host.name']);
  });

  it('handles empty metric', () => {
    const metric = makeMetric([]);
    const stats = calculateAttributeStatsForMetric(metric);
    expect(stats.attrUniq).toEqual({});
    expect(stats.attrRank).toEqual([]);
  });
});

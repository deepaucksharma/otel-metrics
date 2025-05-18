import { describe, it, expect } from 'vitest';
import { encodeSeriesKey, decodeSeriesKey, NULL_PLACEHOLDER } from '../src/logic/workers/utils/seriesKeyEncoder';

describe('seriesKeyEncoder', () => {
  it('round trips encode and decode', () => {
    const key = encodeSeriesKey(
      'metric.count',
      { region: 'us', zone: null },
      { host: 'srv1', active: true, count: 5 }
    );
    const decoded = decodeSeriesKey(key);
    expect(decoded).not.toBeNull();
    expect(decoded?.metricName).toBe('metric.count');
    expect(decoded?.attributes).toEqual({
      region: 'us',
      zone: NULL_PLACEHOLDER,
      host: 'srv1',
      active: true,
      count: 5,
    });
  });

  it('decode returns null on malformed key', () => {
    expect(decodeSeriesKey('')).toBeNull();
    expect(decodeSeriesKey('metric|a')).toBeNull();
  });
});

import { describe, it, expect } from 'vitest';
import { estimateJaccard } from '../src/logic/processing/jaccardEstimator';

describe('estimateJaccard', () => {
  it('returns 1 for two empty sets', () => {
    expect(estimateJaccard({}, {})).toBe(1);
  });

  it('returns 1 for identical maps', () => {
    expect(estimateJaccard({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(1);
  });

  it('returns 0 for disjoint sets', () => {
    expect(estimateJaccard({ a: 1 }, { b: 2 })).toBe(0);
  });

  it('computes partial overlap', () => {
    expect(estimateJaccard({ a: 1, b: 2 }, { a: 1, b: 3 })).toBeCloseTo(0.5);
  });
});

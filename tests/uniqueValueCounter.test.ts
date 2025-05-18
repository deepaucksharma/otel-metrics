import { describe, it, expect } from 'vitest';
import { getUniqueValues, countUniqueValues } from '../src/logic/processing/utils/uniqueValueCounter';

describe('uniqueValueCounter', () => {
  it('counts and collects unique primitives', () => {
    const values = ['a', 'b', 'a', 1, 1, true, false];
    const set = getUniqueValues(values);
    expect(Array.from(set)).toEqual(['a', 'b', 1, true, false]);
    expect(countUniqueValues(values)).toBe(5);
  });

  it('treats numbers and strings separately', () => {
    const values = ['42', 42];
    expect(countUniqueValues(values)).toBe(2);
  });

  it('handles empty iterable', () => {
    expect(countUniqueValues([])).toBe(0);
    expect(Array.from(getUniqueValues([]))).toEqual([]);
  });
});

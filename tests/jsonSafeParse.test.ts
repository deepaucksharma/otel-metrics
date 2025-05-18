import { describe, it, expect } from 'vitest';
import { jsonSafeParse } from '../src/logic/workers/utils/jsonSafeParse';

describe('jsonSafeParse', () => {
  it('parses valid JSON', () => {
    const res = jsonSafeParse('{"a":1}');
    expect(res).toEqual({ type: 'right', value: { a: 1 } });
  });

  it('returns error for invalid JSON', () => {
    const res = jsonSafeParse('{oops');
    expect(res.type).toBe('left');
    if (res.type === 'left') {
      expect(res.value).toBeInstanceOf(Error);
    }
  });
});

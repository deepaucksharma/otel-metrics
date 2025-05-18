import { describe, it, expect } from 'vitest';
import { extractExemplars } from '../src/logic/workers/utils/exemplarExtractor';
import type { RawOtlpExemplar } from '../src/contracts/rawOtlpTypes';

describe('extractExemplars', () => {
  it('returns empty array for undefined', () => {
    expect(extractExemplars(undefined)).toEqual([]);
  });

  it('maps exemplar fields and attributes', () => {
    const raw: RawOtlpExemplar[] = [
      {
        timeUnixNano: '1',
        asDouble: 2.5,
        spanId: 's',
        traceId: 't',
        filteredAttributes: [
          { key: 'a', value: { stringValue: 'v' } },
          { key: 'b', value: { intValue: '5' } },
          { key: 'c', value: { doubleValue: 1.2 } },
          { key: 'd', value: { boolValue: true } },
          { key: 'skip', value: { kvlistValue: [] as any } },
        ],
      },
    ];
    const ex = extractExemplars(raw);
    expect(ex).toEqual([
      {
        timeUnixNano: 1,
        value: 2.5,
        spanId: 's',
        traceId: 't',
        attributes: { a: 'v', b: 5, c: 1.2, d: true },
      },
    ]);
  });
});

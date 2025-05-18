// Transform raw OTLP exemplar objects into lightweight `ExemplarData`.

import type { ExemplarData, AttrMap } from '@/contracts/types';
import type { RawOtlpExemplar } from '@/contracts/rawOtlpTypes';

/**
 * Map an array of raw OTLP exemplars to the internal {@link ExemplarData} shape.
 *
 * ### Mapping rules
 * - `timeUnixNano` is parsed to `number`.
 * - `value` prefers `asDouble` and falls back to `asInt`.
 * - `spanId` and `traceId` are copied verbatim.
 * - `attributes` are converted from `filteredAttributes` into an {@link AttrMap}
 *   keeping only primitive values.
 *
 * The function never throws and always returns an array (possibly empty).
 *
 * @param raw - Array of `RawOtlpExemplar` values or `undefined`.
 * @returns Array of `ExemplarData` ready for UI consumption.
 *
 * #### Tests
 * - Undefined input → returns `[]`.
 * - Mixed `asDouble`/`asInt` → numeric conversion.
 * - Attribute coercion for string/int/bool primitives.
 * - Skips `arrayValue` and `kvlistValue`.
 */
export function extractExemplars(raw: RawOtlpExemplar[] | undefined): ExemplarData[] {
  if (!raw || raw.length === 0) {
    return [];
  }

  const result: ExemplarData[] = [];

  for (const r of raw) {
    const value = r.asDouble ?? Number(r.asInt ?? 0);
    const attributes: AttrMap = {};

    if (Array.isArray(r.filteredAttributes)) {
      for (const kv of r.filteredAttributes) {
        const key = kv.key;
        const v = kv.value ?? {};
        if (typeof v.stringValue === 'string') {
          attributes[key] = v.stringValue;
        } else if (v.intValue !== undefined) {
          attributes[key] = Number(v.intValue);
        } else if (typeof v.doubleValue === 'number') {
          attributes[key] = v.doubleValue;
        } else if (typeof v.boolValue === 'boolean') {
          attributes[key] = v.boolValue;
        }
      }
    }

    result.push({
      timeUnixNano: Number(r.timeUnixNano),
      value,
      spanId: r.spanId,
      traceId: r.traceId,
      attributes,
    });
  }

  return result;
}

/**
 * @layer Parser Worker
 * @summary TODO
 *
 * ## Purpose
 *
 * TODO
 *
 * ## Algorithm/Visual
 *
 * TODO
 *
 * @perfBudget TODO
 * @loc_estimate TODO
 */

/**
 * Zero-dependency helper converting raw JSON text to objects without throwing.
 *
 * ### Either return type
 * `jsonSafeParse` returns a discriminated union:
 * - `{ type: 'right', value: T }` when parsing succeeds.
 * - `{ type: 'left',  value: Error }` when `JSON.parse` throws.
 *
 * ### Algorithm
 * 1. Attempt to parse with `JSON.parse`.
 * 2. On success, wrap the result in `right`.
 * 3. On failure, ensure the caught value is an `Error` (wrap otherwise).
 * 4. Return the error in `left` so callers avoid try/catch blocks.
 *
 * ### Tests
 * - Valid JSON `'{}'` → `type` is `right`.
 * - Invalid `'foo{'` → `type` is `left` with message containing `"Unexpected token"`.
 * - Parsing a 10 MB string completes within ~20 ms on a 3 GHz worker.
 */
export type Either<L, R> =
  | { type: 'left'; value: L }
  | { type: 'right'; value: R };

/**
 * Safely parse a JSON string without throwing.
 *
 * @param jsonText - Raw JSON text to parse.
 * @returns Either with the parsed object on success or the encountered Error.
 */
export function jsonSafeParse<T = any>(jsonText: string): Either<Error, T> {
  try {
    return { type: 'right', value: JSON.parse(jsonText) as T };
  } catch (err) {
    const error = err instanceof Error ? err : new Error('Unknown parse error');
    return { type: 'left', value: error };
  }
}

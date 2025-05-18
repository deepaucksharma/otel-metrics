/**
 * Collection of formatting helpers used across UI components.
 */
/**
 * Format a Unix nanosecond timestamp into a locale string.
 *
 * @param ns - Timestamp in nanoseconds
 * @param long - Include the date portion when true
 */
export function formatTimestamp(ns: number, long = false): string {
  const date = new Date(Math.floor(ns / 1_000_000));
  return long ? date.toLocaleString() : date.toLocaleTimeString();
}

export const formatters = {
  /** Format a number with thousand separators. */
  int(value: number): string {
    return value.toLocaleString();
  },

  /** Format a number with SI unit suffix (K, M, G, etc). */
  SI(value: number): string {
    if (value < 1000) return value.toString();
    if (value < 1000000) return `${(value / 1000).toFixed(1)}K`;
    if (value < 1000000000) return `${(value / 1000000).toFixed(1)}M`;
    return `${(value / 1000000000).toFixed(1)}G`;
  },

  /** Format a delta value (change) with a + or - sign. */
  deltaAbs(value: number): string {
    return Math.abs(value).toLocaleString();
  },

  /** Format a duration value in appropriate units. */
  duration(value: number, unit: string): string {
    if (unit === 'ms' && value > 1000) {
      return `${(value / 1000).toFixed(2)}s`;
    }
    return `${value}${unit}`;
  },

  /** Format a Unix nanosecond timestamp. */
  timestamp(value: number, withDate = false): string {
    return formatTimestamp(value, withDate);
  },
};

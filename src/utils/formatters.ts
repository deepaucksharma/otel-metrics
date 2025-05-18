/**
 * @file src/utils/formatters.ts
 * @summary formatters module
 * @layer 
 * @remarks
 * Layer derived from Architecture-Principles.md.
 */
/**
 * Format a number with thousand separators.
 */
export function fmtInt(value: number): string {
  return value.toLocaleString();
}

/**
 * Format a number with SI unit suffix (K, M, G, etc).
 */
export function fmtSI(value: number): string {
  if (value < 1000) return value.toString();
  if (value < 1000000) return `${(value / 1000).toFixed(1)}K`;
  if (value < 1000000000) return `${(value / 1000000).toFixed(1)}M`;
  return `${(value / 1000000000).toFixed(1)}G`;
}

/**
 * Format a delta value (change) with a + or - sign.
 */
export function fmtDeltaAbs(value: number): string {
  return Math.abs(value).toLocaleString();
}

/**
 * Format a duration value in appropriate units.
 */
export function formatDuration(value: number, unit: string): string {
  if (unit === 'ms' && value > 1000) {
    return `${(value / 1000).toFixed(2)}s`;
  }
  return `${value}${unit}`;
}

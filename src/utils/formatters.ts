/**
 * Formatting helpers for consistent data presentation across the Inspector UI.
 *
 * These utilities centralize locale-aware formatting logic. Locale defaults
 * to `navigator.language` but can be overridden by callers (useful for tests
 * or server-side rendering environments).
 */

/** Cache of Intl.NumberFormat instances for integer formatting. */
const intFmtCache = new Map<string, Intl.NumberFormat>();

/** Retrieve or create an Intl.NumberFormat for integers. */
const getIntFormatter = (locale: string): Intl.NumberFormat => {
  let fmt = intFmtCache.get(locale);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });
    intFmtCache.set(locale, fmt);
  }
  return fmt;
};

/** Cache of Intl.NumberFormat instances for percent formatting. */
const pctFmtCache = new Map<string, Intl.NumberFormat>();

/** Retrieve or create an Intl.NumberFormat for percentages. */
const getPercentFormatter = (locale: string): Intl.NumberFormat => {
  let fmt = pctFmtCache.get(locale);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });
    pctFmtCache.set(locale, fmt);
  }
  return fmt;
};

/**
 * Format integer with thousand separators.
 *
 * @param value - The number to format.
 * @param locale - Optional BCP 47 locale string. Defaults to the browser's
 *   language.
 * @returns The locale-aware formatted integer.
 */
export const fmtInt = (value: number, locale = navigator.language): string => {
  return getIntFormatter(locale).format(Math.round(value));
};

/**
 * Format ratio as a percentage with one decimal place.
 *
 * @param value - Ratio from 0 to 1.
 * @param locale - Optional locale override.
 * @returns Formatted percentage string.
 */
export const fmtPercent = (
  value: number,
  locale = navigator.language,
): string => {
  return getPercentFormatter(locale).format(value);
};

/**
 * Format a timestamp (in nanoseconds) into a human readable string.
 *
 * @param timeUnixNano - Timestamp as Unix epoch nanoseconds.
 * @param includeMs - Include milliseconds in the output.
 * @returns Formatted date string ("YYYY-MM-DD HH:mm:ss[.SSS]").
 */
export const formatTimestamp = (
  timeUnixNano: number,
  includeMs = false,
): string => {
  const date = new Date(timeUnixNano / 1_000_000); // ns -> ms
  if (includeMs) {
    return date.toISOString().replace('T', ' ').slice(0, 23).replace('Z', '');
  }
  return date.toISOString().replace('T', ' ').slice(0, 19).replace('Z', '');
};

/**
 * Format a duration expressed in nanoseconds using an appropriate unit.
 *
 * @param value - Duration value.
 * @param unit - Explicit unit ("ns", "μs", "ms", "s"). If omitted the unit is
 *   automatically determined.
 * @returns Human readable duration string.
 */
export const formatDuration = (value: number, unit?: string): string => {
  if (unit) {
    return `${value} ${unit}`;
  }
  if (value < 1_000) {
    return `${value} ns`;
  }
  if (value < 1_000_000) {
    return `${(value / 1_000).toFixed(1)} μs`;
  }
  if (value < 1_000_000_000) {
    return `${(value / 1_000_000).toFixed(1)} ms`;
  }
  return `${(value / 1_000_000_000).toFixed(1)} s`;
};

/**
 * Format a number with SI suffixes (K, M, G, T, P).
 *
 * @param value - Numeric value to format.
 * @param precision - Decimal places to include.
 * @returns Value with SI suffix.
 */
export const fmtSI = (value: number, precision = 1): string => {
  const suffixes = ['', 'K', 'M', 'G', 'T', 'P'];
  let tier = 0;
  while (value >= 1000 && tier < suffixes.length - 1) {
    tier += 1;
    value /= 1000;
  }
  return `${value.toFixed(precision)}${suffixes[tier]}`;
};

/**
 * Format an absolute delta with a sign prefix.
 *
 * Positive numbers receive a "+" prefix. Negative numbers retain the "-".
 *
 * @param value - Delta value to display.
 * @param locale - Optional locale override used for integer formatting.
 * @returns Signed delta string.
 */
export const fmtDeltaAbs = (
  value: number,
  locale = navigator.language,
): string => {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${fmtInt(Math.abs(value), locale)}`;
};

/**
 * Format a percentage delta with a sign prefix.
 *
 * @param value - Delta ratio from -1 to 1.
 * @param locale - Optional locale override.
 * @returns Signed percentage string.
 */
export const fmtDeltaPct = (
  value: number,
  locale = navigator.language,
): string => {
  const sign = value >= 0 ? '+' : '-';
  return `${sign}${fmtPercent(Math.abs(value), locale)}`;
};

// Tests cover locale overrides and edge cases for each formatter.

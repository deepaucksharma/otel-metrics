# formatters.ts – spec
*(Utility nano-module · ≈ 60 LoC)*

---

## 1. Purpose

Provide formatting helpers for presenting data consistently across the
Inspector UI. Encapsulates formatting logic so components simply call
the appropriate formatter without handling locale quirks or formatting details.

---

## 2. Public API

```ts
// src/utils/formatters.ts

/** Format integer with thousand separators (locale-aware). */
export function fmtInt(value: number, locale?: string): string;

/** Format ratio as percentage with one decimal place. */
export function fmtPercent(value: number, locale?: string): string;

/** Format timestamp in human readable format with optional milliseconds. */
export function formatTimestamp(timeUnixNano: number, includeMs?: boolean): string;

/** Format duration in appropriate units (ns, μs, ms, s). */
export function formatDuration(value: number, unit?: string): string;

/** Format with SI suffixes (K, M, G, T). */
export function fmtSI(value: number, precision?: number): string;

/** Format absolute delta with sign (e.g., +1.2K, -500). */
export function fmtDeltaAbs(value: number): string;

/** Format percentage delta with sign (e.g., +12.5%, -3.0%). */
export function fmtDeltaPct(value: number): string;
```

## 3. Usage Examples

```ts
fmtInt(8950)                     // "8,950" in en-US
fmtPercent(0.237)                // "23.7%"
formatTimestamp(1621234567890000000)   // "2021-05-17 12:34:56"
formatTimestamp(1621234567890000000, true)  // "2021-05-17 12:34:56.890"
formatDuration(1500000)          // "1.5 ms"
formatDuration(150, "ms")        // "150 ms" 
fmtSI(1500000)                   // "1.5M"
fmtDeltaAbs(1234)                // "+1,234"
fmtDeltaAbs(-567)                // "-567"
fmtDeltaPct(0.125)               // "+12.5%"
```

Locale defaults to `navigator.language`; callers may override for tests or
server rendering.

## 4. Implementation Outline

```ts
const fmtInt = (n: number, l = navigator.language) =>
  new Intl.NumberFormat(l, { maximumFractionDigits: 0 }).format(n);

const fmtPercent = (r: number, l = navigator.language) =>
  new Intl.NumberFormat(l, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(r);

const formatTimestamp = (timeUnixNano: number, includeMs = false) => {
  const date = new Date(timeUnixNano / 1000000); // Convert from ns to ms
  
  if (includeMs) {
    return date.toISOString().replace('T', ' ').slice(0, 23).replace('Z', '');
  }
  
  return date.toISOString().replace('T', ' ').slice(0, 19).replace('Z', '');
};

const formatDuration = (value: number, unit?: string) => {
  if (unit) {
    return `${value} ${unit}`;
  }
  
  // Auto-determine appropriate unit
  if (value < 1000) {
    return `${value} ns`;
  } else if (value < 1000000) {
    return `${(value / 1000).toFixed(1)} μs`;
  } else if (value < 1000000000) {
    return `${(value / 1000000).toFixed(1)} ms`;
  } else {
    return `${(value / 1000000000).toFixed(1)} s`;
  }
};

const fmtSI = (value: number, precision = 1) => {
  const suffixes = ['', 'K', 'M', 'G', 'T', 'P'];
  let tier = 0;
  
  while (value >= 1000 && tier < suffixes.length - 1) {
    tier++;
    value = value / 1000;
  }
  
  return `${value.toFixed(precision)}${suffixes[tier]}`;
};

const fmtDeltaAbs = (value: number, l = navigator.language) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${fmtInt(value, l)}`;
};

const fmtDeltaPct = (value: number, l = navigator.language) => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${fmtPercent(Math.abs(value), l)}`;
};
```

Cache `Intl.NumberFormat` instances in the real module for perf.

## 5. Internationalisation Notes

- Thousand and decimal separators vary by locale (`1,000` vs `1 000`).
- `fmtPercent` expects a **ratio** (0–1) rather than raw percent value.
- Browsers without full `Intl` support may need a polyfill.
- Future versions could accept an explicit locale from settings.

## 6. Consumers
- Metric summary widgets and rarity indicators use fmtInt and fmtPercent
- ExemplarsZone uses formatTimestamp and formatDuration
- ValueZone uses fmtInt and formatDuration
- Dashboard views use fmtSI, fmtDeltaAbs, and fmtDeltaPct

## 7. Tests

```ts
✓ fmtInt(1234, 'en-US') → "1,234"
✓ fmtInt(1234, 'de-DE') → "1.234"
✓ fmtPercent(0.5, 'en-US') → "50.0%"
✓ formatTimestamp(1621234567890000000) → "2021-05-17 12:34:56"
✓ formatDuration(1500000) → "1.5 ms"
✓ fmtSI(1500000) → "1.5M"
✓ fmtDeltaAbs(-567) → "-567"
```
# formatters.ts – spec
*(Utility nano-module · ≈ 30 LoC)*

---

## 1. Purpose

Provide tiny helpers for presenting numbers consistently across the
Inspector UI. Encapsulates `Intl.NumberFormat` so components simply call
`fmtInt()` or `fmtPercent()` without worrying about locale quirks.

---

## 2. Public API

```ts
// src/utils/formatters.ts

/** Format integer with thousand separators (locale-aware). */
export function fmtInt(value: number, locale?: string): string;

/** Format ratio as percentage with one decimal place. */
export function fmtPercent(value: number, locale?: string): string;
```

## 3. Usage Examples

```ts
fmtInt(8950)      // "8,950" in en-US
fmtPercent(0.237) // "23.7%"
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
```

Cache `Intl.NumberFormat` instances in the real module for perf.

## 5. Internationalisation Notes

- Thousand and decimal separators vary by locale (`1,000` vs `1 000`).
- `fmtPercent` expects a **ratio** (0–1) rather than raw percent value.
- Browsers without full `Intl` support may need a polyfill.
- Future versions could accept an explicit locale from settings.

## 6. Consumers
Metric summary widgets and rarity indicators display formatted counts and
percentages via these helpers.

## 7. Tests

```ts
✓ fmtInt(1234, 'en-US') → "1,234"
✓ fmtInt(1234, 'de-DE') → "1.234"
✓ fmtPercent(0.5, 'en-US') → "50.0%"
```

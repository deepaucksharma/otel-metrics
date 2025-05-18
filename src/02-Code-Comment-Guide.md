# Code Comment Guide
*(TSDoc tags and examples)*

---

## Required Tags

| Tag | Description |
|-----|-------------|
| `@purpose` | Briefly states why the module or function exists. |
| `@algorithm` | Lists key steps of non-trivial logic in bullet or numbered form. |
| `@perfBudget` | **Deprecated.** Historical tag for stating local performance targets. Budgets now live in [Architecture Principles](01-Architecture-Principles.md#6-performance-budgets). |

`@perfBudget` may still appear in legacy files but should not be added to new code.

## Good Comment Example

```ts
/**
 * Map histogram buckets to cumulative counts.
 *
 * @purpose Translate raw bucket counts into an easy-to-consume array.
 * @algorithm
 * 1. Preallocate an array sized to the input length.
 * 2. Iterate through the buckets and keep a running total.
 * 3. Return the accumulated array.
 */
export function buildCumulativeBuckets(buckets: number[]): number[] {
  const out: number[] = new Array(buckets.length);
  let total = 0;
  for (let i = 0; i < buckets.length; i += 1) {
    total += buckets[i];
    out[i] = total;
  }
  return out;
}
```

## Bad Comment Example

```ts
// build bucket array
action(b) {
  // magic math
}
```

The bad example omits `@purpose`, hides the algorithm, and uses unclear names.

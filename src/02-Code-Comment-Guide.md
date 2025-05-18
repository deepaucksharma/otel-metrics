# Code Comment Guide
*(TSDoc tags and examples)*

---

## Required File Header

Every TypeScript module begins with the same structured TSDoc block. The header
contains the following tags in order:

- `@file` – A short title for the module.
- `@summary` – One sentence summarising the module's role.
- `@remarks` – Expanded documentation with two subsections:
  - **Purpose** – Why the module exists and how it fits in.
  - **Public API** – What the module exports and any usage notes.
- `@layer` – The architecture layer name from
  [Architecture Principles](01-Architecture-Principles.md#1-layer-model).

The historical `@perfBudget` tag is deprecated. Performance budgets now live in
[Architecture Principles](01-Architecture-Principles.md#6-performance-budgets)
and should not be added to new files, though it may appear in legacy headers.

### Example Header

```ts
/**
 * @file StaticFileProvider.tsx
 * @summary Browser UI for loading snapshot files.
 * @remarks
 * ### Purpose
 * Provides a drag-and-drop area to load local snapshots and send them to the parser worker.
 * ### Public API
 * - `StaticFileProvider` React component
 * - `StaticFileProviderProps` interface
 * @layer Data Provider
 */
```

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

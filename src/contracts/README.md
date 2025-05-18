# Contracts Directory

This folder hosts the TypeScript interfaces used across the project.

## `types.ts` vs `rawOtlpTypes.ts`
- **types.ts** contains the canonical data structures consumed by all nano-modules. These "parsed" types are stable and used throughout the UI, state, and processing layers.
- **rawOtlpTypes.ts** mirrors the JSON schema produced by `otelcol` when it serializes OTLP protobufs. It is used only inside parser/mapper workers so that this verbose representation does not pollute the rest of the app.

## Versioning policy
- The workspace follows Semantic Versioning. Any breaking change to `types.ts` or `rawOtlpTypes.ts` must be documented in `CHANGELOG.md` with a `BREAKING:` note and may trigger a major version bump.
- If a migration is required, provide automated codemods or detailed steps in the changelog.

## Historic conventions (from the removed `03-Data-Contracts.md`)
- Timestamps use Unix nanoseconds (`TimestampUnixNano`).
- `AttrValue` is limited to primitive types (`string | number | boolean`).
- Field names are camelCase to mirror the OTLP JSON transformation.
- Optional fields never use `null`; omit the property instead.

These rules continue to apply to all contract updates.

# Config Module
*(Shared constants and feature flags)*

---

## 1. Purpose

Central location for small numeric defaults and feature switches that need to be referenced across multiple modules. Keeping them in one place avoids magic numbers and simplifies future tuning.

---

## 2. Exports

```ts
// src/config/index.ts
export const DEFAULT_THRESHOLD_HIGH = 2000; // CRingSvg colour ramp
```

No other global numeric or feature flags currently exist. Additional constants will be added here when new cross-module features emerge.

## 3. Import Pattern

Modules should import constants directly from `@/config` using the project alias:

```ts
import { DEFAULT_THRESHOLD_HIGH } from '@/config';
```

This keeps usage consistent and enables straightforward tooling support.


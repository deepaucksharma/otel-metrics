# exemplarExtractor.ts – spec  
*(Parser-Worker nano-module · ≈ 45 LoC)*

---

## 1. Purpose

Transform raw OTLP exemplar objects (from histogram / sum data-points) into the
app-internal, lightweight `ExemplarData` format:

| Field            | Mapping rule                                        |
| ---------------- | --------------------------------------------------- |
| `timeUnixNano`   | copy, parsed to **number**                          |
| `value`          | prefer `asDouble`; else `Number(asInt)`             |
| `spanId`/`traceId` | copy (hex strings)                               |
| `attributes`     | OTLP K/V array → `AttrMap` (primitive values only)  |

---

## 2. Public API

```ts
// src/logic/workers/utils/exemplarExtractor.ts
import type { ExemplarData }           from '@/contracts/types';
import type { RawOtlpExemplar }        from '@/contracts/rawOtlpTypes';

/**
 * Map an array of raw OTLP exemplars to internal shape.
 * Returns [] if undefined/null.
 */
export function extractExemplars(
  raw: RawOtlpExemplar[] | undefined
): ExemplarData[];
```

Always returns array length ≥ 0; never throws—caller can safely render.

## 3. Internal Logic

```
if !raw || raw.length === 0 → []

for each r in raw:
  val ← r.asDouble ?? Number(r.asInt ?? 0)
  attrs ← {}
  for each kv in r.filteredAttributes:
      if kv.value.stringValue  → attrs[k]=string
      if kv.value.intValue     → attrs[k]=Number(int)
      if kv.value.doubleValue  → attrs[k]=double
      if kv.value.boolValue    → attrs[k]=bool
  push {
    timeUnixNano: Number(r.timeUnixNano),
    value       : val,
    spanId      : r.spanId,
    traceId     : r.traceId,
    attributes  : attrs
  }
```

Unsupported OTLP attribute types (arrays / kvlist) are silently skipped.

## 4. Dependencies
contracts/types.ts (for ExemplarData, AttrMap)

rawOtlpTypes.ts (JSON schema interfaces)

No external libraries.

## 5. Consumers
otlpMapper.ts – when creating ParsedPoint, attaches exemplars.

UI ExemplarTimeline organism—renders these objects verbatim.

## 6. Tests
| Scenario | Expect |
|----------|--------|
| Undefined input | returns [] |
| Mixed asDouble / asInt | correct numeric conversion |
| Attribute coercion (string/int/bool) | values typed as primitives |
| Skips arrayValue / kvlistValue | not present in result |

## 7. Performance
Inflating exemplar arrays is negligible:
100 k exemplars → < 4 ms in worker on 3 GHz desktop.

## 8. Stability Contract
If OTLP adds new primitive exemplar value types, extend switch but never
change field names—UI relies on current shape.
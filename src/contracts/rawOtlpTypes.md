# Raw OTLP Types (`src/contracts/rawOtlpTypes.ts`)
*(Worker-only schema mirror of protobuf‑JSON)*

---

## 1. Purpose

This module defines a minimal set of TypeScript interfaces that map **1‑to‑1** to the JSON representation produced when the OpenTelemetry Collector converts protobuf metrics to JSON. These types are only used inside the parser and mapping workers and never leak into UI or public contracts.

---

## 2. Interface Summary

- **`RawOtlpExportMetricsServiceRequest`** – top‑level object containing an array of `resourceMetrics`.
- **`RawOtlpResourceMetrics`** – wraps optional `resource` attributes and an array of `scopeMetrics`.
- **`RawOtlpScopeMetrics`** – holds instrumentation scope info (`scope.name`, `scope.version`, `scope.attributes`) and the list of `metrics`.
- **`RawOtlpMetric`** – single metric definition with one of `gauge`, `sum`, or `histogram` sections, each exposing their respective `dataPoints` arrays.
- **`RawOtlpNumberDataPoint`** – numeric data point (`asInt` or `asDouble`) with `timeUnixNano`, optional `startTimeUnixNano`, `attributes`, and `exemplars`.
- **`RawOtlpHistogramDataPoint`** – histogram point with `count`, optional `sum`, `bucketCounts`, `explicitBounds`, optional `min`, `max`, and `exemplars`.
- **`RawOtlpExemplar`** – exemplar value carrying `timeUnixNano`, numeric value, optional `spanId`, `traceId`, and `filteredAttributes`.
- **`RawOtlpKeyValue`** – helper shape for attribute arrays (`key` + primitive `value`).

These interfaces intentionally keep the exact field names (including numeric strings) used in OTLP‑JSON so that workers can safely parse and validate incoming payloads before converting them to the cleaner contracts in `types.ts`.

---

## 3. Usage Notes

The raw types are imported only by worker modules such as `parser.worker.ts`, `otlpMapper.ts`, and `exemplarExtractor.ts`. Application components never see these shapes directly. After mapping, UI code relies solely on the parsed contracts defined in `types.ts`.


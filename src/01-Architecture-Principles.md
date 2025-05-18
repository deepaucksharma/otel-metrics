# IntelliMetric Explorer – Architecture Principles  
*(Nano-module codebase · Inspector 1.1 scope)*

---

## 0. Prime Directive

> **Every file has one job.**  
> 50–150 lines, strict public interface, zero hidden side-effects.

---

## 1. Layer Model

| Layer # | Name                      | Folder prefix | May import…                        | Must **not** import…                    |
| ------- | ------------------------- | ------------- | ---------------------------------- | --------------------------------------- |
| 0       | **Contracts**             | `src/contracts` | built-ins only                     | anything outside `contracts/`           |
| 1       | **Data Provider**         | `src/data`      | Contracts                          | State, UI, Processing                   |
| 2       | **Parser Worker**         | `src/logic/workers` | Contracts (and its own utils)     | State, UI                               |
| 3       | **Metric Processing**     | `src/logic/processing` | Contracts, Parser utils          | UI                                      |
| 4       | **Global State**          | `src/state`     | Contracts                          | UI                                      |
| 5       | **Hooks**                 | `src/hooks`     | Contracts, State, Processing       | Data, Workers                           |
| 6       | **UI Atoms → Layouts**    | `src/ui`        | Contracts, Hooks, State selectors  | Data, Workers, Processing (direct)      |
| 7       | **Services (event bus)**  | `src/services` | Contracts                          | UI                                      |

ESLint "no-restricted-paths" enforces these arrows.
`logic/processing/*` modules may import from `logic/workers/utils/*` when those utilities are small, synchronous, and pure.

---

## 2. Nano-module Ground Rules

| # | Rule | Why |
|---|------|-----|
| 2.1 | ≤ 150 LoC (excluding imports, type defs, tests, CSS). | Keeps complexity diff-able. |
| 2.2 | Export **only**: functions, types, or React components; no side-effect code at import-time. | Enables safe tree-shaking and jest-isolation. |
| 2.3 | One default export **or** a named API object; never both. | Clear call-site ergonomics. |
| 2.4 | Co-locate: `Component.tsx`, `Component.md`, `Component.test.ts`, `Component.module.css`. | Docs/tests never drift from code. |
| 2.5 | Pure logic modules never reach into global state. | Deterministic unit tests. |
| 2.6 | UI modules receive all data via **props**; never call Zustand directly. | Encourages storybook isolation. |

---

## 3. Data Contracts & Type Safety

* **Single source**: `src/contracts/types.ts`.  
* All cross-layer payloads (`ParsedSnapshot`, `InspectorProps`, etc.) derive from these base types.  
* Use *branded* primitives for critical numbers:

```ts
type SeriesCount = number & { __brand: 'SeriesCount' };
```
Prevents accidental mix-ups (e.g., "unique values" vs "series total").

## 4. State Philosophy
Zustand + immer for tiny, predictable slices.

- metricsSlice → immutable map of ParsedSnapshots.
- uiSlice → pointers only (snapshot-id, metricName, seriesKey).
- Selectors in hooks ➔ no component re-render storms.

## 5. Event Bus vs Callbacks
| Use case | Mechanism |
|----------|-----------|
| Data-load / parse events | mitt bus (data.*) |
| UI navigation cues | bus (ui.*) |
| Child → parent within same React tree | plain callback props |

If you find yourself wanting a bus event inside a single render tree, refactor to props.

## 6. Performance Budgets
| Step | Target |
|------|--------|
| Gzip → JSON parse (worker) | 500 ms for 20 MB |
| Worker → main thread copy | < 2 ms |
| Inspector FCP after click | < 60 ms |
| Attribute drop simulation calc | < 40 ms for 100 k series |

Fail a unit-perf test if budgets regress.

## 7. Testing Matrix
| Layer | Tooling | Minimum coverage |
|-------|---------|------------------|
| Data Provider | Jest + fake File | happy + error paths |
| Parser Worker | Vitest in worker env | JSON edge cases |
| Processing | Jest | 100 % branch on maths |
| Hooks | React Testing Library | basic reactivity |
| UI Atoms | Storybook screenshot | per variant |
| Layout (E2E) | Playwright | load snapshot → open Inspector |

## 8. Accessibility & i18n
- Colour tokens meet WCAG AA on dark theme.
- All interactive elements get aria-label.
- Text labels piped through tiny t() util—even if only English now.

## 9. Versioning & CHANGELOG
- SemVer at workspace root.
- Breaking prop or contract changes require BREAKING: note in commit body.

These principles are non-negotiable; every PR must show which rule it touches.
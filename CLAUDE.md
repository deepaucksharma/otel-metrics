# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IntelliMetric Explorer / Data-Point Inspector Drawer is a specialized UI component for observability platforms that handle OTLP (OpenTelemetry Protocol) metrics. It provides a detailed view of individual metric data points, with emphasis on cardinality visualization and schema comprehension within a static snapshot.

### Key Features

- A 660px slide-in panel for showing comprehensive data about a single OTLP metric data point
- Cardinality visualization system (C-Ring, B-MiniBars, P-Rarity Dots)
- Interactive attribute exploration with simulation capabilities
- Exemplars timeline visualization integrated in the `ExemplarsZone` component
- Raw JSON access with copy functionality

## Development Commands

```bash
# Install dependencies
pnpm i

# Start development server
pnpm dev

# Build for production
pnpm build 

# Run unit tests
pnpm test:unit

# Run end-to-end tests
pnpm test:e2e

# Run specific test patterns
pnpm test:unit -- --testPathPattern=fileProvider

# Generate test coverage report
pnpm test:unit -- --coverage

# Lint code
pnpm lint

# Type check
pnpm typecheck

# Build Storybook
pnpm build:storybook

# Build documentation
pnpm docs:mkdocs
```

## Project Architecture

### Nano-module Architecture

This project follows a strict nano-module architecture where:
- Every file has one job (50-150 lines)
- Each module has a strict public interface with no hidden side-effects
- Files are co-located with their docs, tests, and CSS modules

### Layer Model

1. **Contracts** (`src/contracts/`) - Type definitions and interfaces
2. **Data Provider** (`src/data/`) - File handling (validation, decompression, reading)
3. **Parser Worker** (`src/logic/workers/`) - Processes OTLP data in a WebWorker
4. **Metric Processing** (`src/logic/processing/`) - Handles attribute stats and cardinality calculations
5. **Global State** (`src/state/`) - Zustand state slices (metrics and UI)
6. **Hooks** (`src/hooks/`) - React hooks for data access
7. **UI Components** (`src/ui/`) - React components (atoms → organisms → layouts)
8. **Services** (`src/services/`) - Event bus and listeners

The architecture enforces strict import rules between layers to maintain boundaries and prevent circular dependencies.

### Data Flow

```
StaticFileProvider → Worker Dispatch → Parser Worker → Event Bus → Metrics Slice → UI Components
```

### Key Technologies

- React with TypeScript
- Zustand + immer for state management
- Vite for build system (HMR and worker bundling)
- mitt for event handling (micro-event bus)
- pako for gzip decompression in-browser
- CSS Modules + tokens.css for styling
- react-window for virtualized lists

## Performance Targets

The project has strict performance budgets:
- < 20ms render time
- < 60ms First Contentful Paint
- < 500ms for Gzip → JSON parsing (worker) for 20MB
- < 40ms for attribute drop simulation calculation (100k series)

Performance tests will fail the build if these budgets are not met.

## Type System

- All cross-layer payloads derive from base types in `src/contracts/types.ts`
- Branded primitives are used for critical numbers to prevent mix-ups
- Strict typing with no optional nulls

## Testing Strategy

The project uses different testing approaches for each layer:

| Layer | Testing Approach | Tools | Coverage Goals |
|-------|-----------------|-------|----------------|
| Data Provider | Unit tests | Jest + file mocks | 95% line, 90% branch |
| Parser Worker | Worker environment tests | Vitest | 95% line, 95% branch |
| Processing Logic | Pure function tests | Jest | 100% branch coverage |
| Hooks | React hooks testing | React Testing Library | 80% line, 70% branch |
| UI Components | Visual regression | Storybook + screenshots | 70% line, 60% branch |
| E2E | End-to-end flows | Playwright | Core user journeys |

The testing harnesses in `tests/harnesses/` provide utilities for each layer's specific testing needs.

## Reading Order for New Developers

1. `src/00-Overview.md` - Project overview
2. `src/01-Architecture-Principles.md` - Contracts and boundaries
3. `src/contracts/README.md` - TypeScript interfaces summary
4. `src/02-Code-Comment-Guide.md` - Code documentation standards

Backend focus path:
- `src/data/*.md` → `src/logic/workers/*.md` → `src/logic/processing/*.md`

Frontend focus path:
- Start with `src/ui/atoms/*.md` and work up to `DataPointInspectorDrawer.md`

## Coding Standards

1. Strict adherence to the nano-module pattern (50-150 lines per file)
2. Export only functions, types, or React components; no side-effect code at import-time
3. Co-locate related files (component, spec, tests, CSS modules)
4. Pure logic modules never reach into global state
5. UI modules receive all data via props; never call Zustand directly

## Documentation

- Markdown specs live directly alongside code in `src/**/*.md`
- Documentation is published to GitHub Pages on pushes to main
- All documentation changes should be reviewed in PRs

## CI/CD Pipeline

The GitHub Actions workflows handle:
- CI checks (lint, unit tests, typecheck, build)
- E2E tests with Playwright
- Documentation publishing
- Security scanning with CodeQL
- Semantic release versioning

## Versioning

- SemVer at workspace root
- Breaking changes to contracts trigger a major version bump
- Changes are documented in CHANGELOG.md

## Project Scope and Objectives

### Objectives
- Enhance metric debugging by providing immediate context and detailed metadata
- Improve cardinality awareness through visual cues and interactive simulations
- Simplify exploration of metric points, attributes, and exemplars
- Enable optimization by helping engineers reduce unnecessary cardinality
- Maintain performance while delivering rich data visualizations

### In Scope
- Static snapshot analysis (single point-in-time)
- Visual representation adapting to metric type (gauge, counter, histogram)
- Attribute exploration with cardinality indicators
- Interactive cardinality simulation (what-if analysis)
- Exemplar visualization when available

### Out of Scope
- Cross-snapshot comparisons
- Real-time updates
- Full metric series analysis
- Advanced filtering capabilities
- Complete accessibility conformance
- Full filter management UI (drawer only triggers `onAddGlobalFilter`)
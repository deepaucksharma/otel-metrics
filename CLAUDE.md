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
Requires Node.js 18.17 or later. All examples use `pnpm`.

```bash
# Install dependencies
pnpm i

# Start development server
pnpm dev

# Run Storybook for component development
pnpm storybook

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

# Generate design tokens from CSS
pnpm generate:tokens

# Run performance budget tests
pnpm test:perf
```

## Project Architecture

### Nano-module Architecture

This project follows a strict nano-module architecture where:
- Every file has one job (50-150 lines)
- Each module has a strict public interface with no hidden side-effects
- Files are co-located with their docs, tests, and CSS modules

### Layer Model

1. **Contracts** (`packages/contracts/`) - Type definitions and interfaces
2. **Data Provider** (`src/data/`) - File handling (validation, decompression, reading)
3. **Parser Worker** (`src/logic/workers/`) - Processes OTLP data in a WebWorker
4. **Metric Processing** (`src/logic/processing/`) - Handles attribute stats and cardinality calculations
5. **Global State** (`src/state/`) - Zustand state slices (metrics and UI)
6. **Hooks** (`src/hooks/`) - React hooks for data access
7. **UI Components** (`src/ui/`) - React components (atoms → organisms → layouts)
8. **Services** (`src/services/`) - Event bus and listeners

The architecture enforces strict import rules between layers to maintain boundaries and prevent circular dependencies:
- Contracts can only import built-ins
- Data Provider can import Contracts, but not State, UI, or Processing
- Parser Worker can import Contracts and its own utils, but not State or UI
- Metric Processing can import Contracts, Parser utils, but not UI
- State can import Contracts, but not UI
- Hooks can import Contracts, State, Processing, but not Data or Workers
- UI can import Contracts, Hooks, State selectors, but not Data, Workers, or direct Processing
- Services can import Contracts, but not UI

ESLint "no-restricted-paths" enforces these import rules with some documented exceptions.

### Data Flow

```
StaticFileProvider → Worker Dispatch → Parser Worker → Event Bus → Metrics Slice → UI Components
```

### Core Functional Flows

#### Data Ingestion Flow
1. User drops/selects OTLP file via `StaticFileProvider.tsx`
2. File is validated, read, and decompressed if needed
3. `dispatchToWorker.ts` sends data to a Web Worker pool (or process synchronously if workers unavailable)
4. Parser worker deserializes JSON and maps to internal structures
5. Worker emits `data.snapshot.parsed` event via event bus
6. Event listeners update metrics slice Zustand state
7. UI components react to state changes

#### UI Rendering Flow
1. `DataPointInspectorDrawer` serves as main container for metric inspection
2. `useInspectorProps` hook assembles props from various sources (UI state, snapshot data, cardinality context)
3. Child components render specific aspects (value visualization, attributes, cardinality, etc.)
4. Interaction events (attribute focus, drop simulation) are handled locally with state lifting when needed
5. Focus trap ensures keyboard accessibility within the drawer

### Key Technologies

- React 19 with TypeScript
- Zustand + immer for state management
- Vite for build system (HMR and worker bundling)
- mitt for event handling (micro-event bus)
- pako for gzip decompression in-browser
- CSS Modules + tokens.css for styling
- react-window for virtualized lists
- lucide-react for icons

## Performance Targets

The project has strict performance budgets:
- < 20ms render time
- < 60ms First Contentful Paint
- < 500ms for Gzip → JSON parsing (worker) for 20MB
- < 40ms for attribute drop simulation calculation (100k series)

Performance tests will fail the build if these budgets are not met.

## Type System

- All cross-layer payloads derive from base types in `packages/contracts/types.ts`
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
3. `packages/contracts/README.md` - TypeScript interfaces summary
4. `src/02-Code-Comment-Guide.md` - Code documentation standards with TSDoc tags

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
6. Code comments must include `@purpose` and `@algorithm` TSDoc tags (see `src/02-Code-Comment-Guide.md`)

## Error Handling

1. Worker errors are caught and propagated through the event bus
2. UI components should implement appropriate error states
3. State updates include error tracking via `registerError` action
4. Missing data paths (null/undefined values) should be explicitly handled in components

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

## UI Theme

The current UI is optimized for dark mode. Contributions for a light theme or automatic `prefers-color-scheme` support would be welcome additions to the project.

## Known Limitations

1. Limited handling for very large snapshots (>1M series)
2. Synchronous fallback for environments without Web Worker support may cause UI freezing
3. No progress indicators for long-running operations
4. No cancellation mechanism for in-flight parsing tasks
5. No persistence or state recovery between sessions
6. Limited keyboard accessibility for complex interactions
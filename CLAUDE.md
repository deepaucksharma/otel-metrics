# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

IntelliMetric Explorer / Data-Point Inspector Drawer is a specialized UI component for observability platforms that handle OTLP (OpenTelemetry Protocol) metrics. It provides a detailed view of individual metric data points, with emphasis on cardinality visualization and schema comprehension within a static snapshot.

### Key Features

- A 660px slide-in panel for showing comprehensive data about a single OTLP metric data point
- Cardinality visualization system (C-Ring, B-MiniBars, P-Rarity Dots)
- Interactive attribute exploration with simulation capabilities
- Exemplar timeline visualization
- Raw JSON access with copy functionality

## Development Commands

```bash
# Start development server
npm start

# Build for production
npm build 

# Run tests
npm test

# Eject from Create React App
npm eject
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

### Data Flow

```
StaticFileProvider → Worker Dispatch → Parser Worker → Event Bus → Metrics Slice → UI Components
```

### Key Technologies

- React 18 with TypeScript
- Zustand + immer for state management
- Vite for build system (HMR and worker bundling)
- mitt for event handling (micro-event bus)
- pako for gzip decompression in-browser
- uPlot for sparklines
- CSS Modules + tokens.css for styling

## Performance Targets

The project has strict performance budgets:
- < 20ms render time
- < 60ms First Contentful Paint
- < 500ms for Gzip → JSON parsing (worker) for 20MB
- < 40ms for attribute drop simulation calculation (100k series)

## Type System

- All cross-layer payloads derive from base types in `src/contracts/types.ts`
- Branded primitives are used for critical numbers to prevent mix-ups
- Strict typing with no optional nulls

## Reading Order for New Developers

1. `src/00-Overview.md` - Project overview
2. `src/01-Architecture-Principles.md` - Contracts and boundaries
3. `src/contracts/03-Data-Contracts.md` - TypeScript interfaces

Backend focus path:
- `src/data/*.md` → `src/logic/workers/*.md` → `src/logic/processing/*.md`

Frontend focus path:
- Start with `src/ui/atoms/*.md` and work up to `DataPointInspectorDrawer.md`

## Testing Requirements

| Layer | Tooling | Minimum coverage |
|-------|---------|------------------|
| Data Provider | Jest + fake File | happy + error paths |
| Parser Worker | Vitest in worker env | JSON edge cases |
| Processing | Jest | 100% branch on maths |
| Hooks | React Testing Library | basic reactivity |
| UI Atoms | Storybook screenshot | per variant |
| Layout (E2E) | Playwright | load snapshot → open Inspector |
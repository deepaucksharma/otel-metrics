# Test Utilities and Conventions

This repo keeps test helpers separate from production modules.

## busMock – event bus interactions

`busMock` is a tiny mitt-based mock used in unit tests. Import it from
`tests/busMock` and use `.emit()`/`.on()` just like the real event bus. Each
call is recorded so expectations stay simple.

## Zustand store helpers

`renderWithStore` wraps React Testing Library rendering with a fresh Zustand
store. State resets between tests so slices stay isolated.

## Storybook snapshots for atoms

UI atoms rely on Storybook for visual regression checks. Stories generate
screenshots per variant and Jest compares them against committed snapshots.

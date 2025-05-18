# Testing

This directory contains unit tests written with [Vitest](https://vitest.dev/) and
[@testing-library/react](https://testing-library.com/docs/react-testing-library/intro/).
The tests focus on UI components and the Zustand state slice used by the
application.

## Test Files

- **AttributeZone.test.tsx** – verifies rarity calculations and interactions in
  the `AttributeZone` component.
- **InstrumentBadge.test.tsx** – checks rendering of the `InstrumentBadge`
  component.
- **ValueZone.test.tsx** – covers rendering logic for values and histograms in
  the `ValueZone` component.
- **uiSlice.test.ts** – exercises the UI state slice helpers and selectors.

## Running Tests

Execute all unit tests with:

```bash
pnpm test:unit
```

Vitest runs in a JSDOM environment. Coverage reports can be generated with:

```bash
pnpm test:unit -- --coverage
```


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
- **validateFile.test.ts** – checks extension and size validation logic.
- **decompressGzip.test.ts** – ensures gzipped buffers inflate correctly and errors propagate.
- **readFile.test.ts** – reads plain and gzipped files via mocked `FileReader`.
- **jsonSafeParse.test.ts** – handles valid and malformed JSON safely.
- **exemplarExtractor.test.ts** – maps raw OTLP exemplars to internal form.
- **attributeStats.test.ts** – computes unique attribute counts and ranking.
- **jaccardEstimator.test.ts** – branch coverage for similarity maths.
- **seriesCardinalityCalc.test.ts** – projects series counts when attributes drop.
- **uniqueValueCounter.test.ts** – tracks unique primitive values.
- **seriesKeyEncoder.test.ts** – encodes and decodes stable series identifiers.

## Running Tests

Execute all unit tests with:

```bash
pnpm test:unit
```

Vitest runs in a JSDOM environment. Coverage reports can be generated with:

```bash
pnpm test:unit -- --coverage
```

## End-to-End Tests

E2E tests use [Playwright](https://playwright.dev/) and run against a local
preview server. Build the app and execute the tests with:

```bash
pnpm build
pnpm test:e2e
```

The workflow `.github/workflows/e2e.yml` runs these tests nightly on CI.


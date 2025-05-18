# Testing Strategy and Harnesses

This document outlines the testing approach used in the IntelliMetric Explorer project.

## Testing Layers

The project uses different testing approaches for each layer of the application:

| Layer | Testing Approach | Tools | Coverage Goals |
|-------|-----------------|-------|----------------|
| Data Provider | Unit tests | Jest + file mocks | 100% coverage of happy and error paths |
| Parser Worker | Worker environment tests | Vitest | 100% coverage of parsing edge cases |
| Processing Logic | Pure function tests | Jest | 100% branch coverage for math functions |
| Hooks | React hooks testing | React Testing Library | Reactivity and state transitions |
| UI Atoms | Visual regression | Storybook + screenshots | Every component variant |
| UI Integration | Component integration | React Testing Library | Key user flows |
| E2E | End-to-end flows | Playwright | Core user journeys |

## Test Harnesses

### Data Provider Test Harness

Located in `tests/harnesses/fileProviderHarness.ts`, provides:

```ts
import { FileProviderHarness } from '../harnesses/fileProviderHarness';

// Usage
const harness = new FileProviderHarness();
harness.mockValidFile('sample.json', JSON.stringify(sampleData));
harness.mockGzippedFile('sample.json.gz', compressedData);
harness.mockInvalidFile('broken.json', 'not json');

const { provider } = harness.getInstance();
await provider.readFile('sample.json');
```

Features:
- Mock file system APIs
- Simulate validation errors
- Simulate compression/decompression
- Track event emissions

### Parser Worker Test Harness

Located in `tests/harnesses/workerHarness.ts`, provides:

```ts
import { ParserWorkerHarness } from '../harnesses/workerHarness';

// Usage
const harness = new ParserWorkerHarness();
const rawData = JSON.stringify(sampleOtlpData);
await harness.sendMessage({ type: 'PARSE_SNAPSHOT', payload: rawData });

expect(harness.getLastMessage()).toEqual({
  type: 'SNAPSHOT_PARSED',
  payload: expect.objectContaining({
    id: expect.any(String),
    resources: expect.any(Array)
  })
});
```

Features:
- Simulates the worker environment
- Intercepts postMessage calls
- Tracks parsing errors
- Simulates worker termination

### Metric Processor Test Harness

Located in `tests/harnesses/processorHarness.ts`, provides:

```ts
import { ProcessorHarness } from '../harnesses/processorHarness';

// Usage
const harness = new ProcessorHarness();
harness.withSnapshot(sampleSnapshot);
harness.withMetricName('http.server.duration');

const result = harness.process({
  simulateDropAttributeKey: 'http.method'
});

expect(result.cardinality.seriesCount).toBeLessThan(originalCount);
```

Features:
- Snapshot factories
- Cardinality calculation validation
- Performance measurements
- Simulation options testing

### Hook Testing Harness

Located in `tests/harnesses/hookHarness.tsx`, provides:

```ts
import { renderHook } from '@testing-library/react-hooks';
import { HookHarness } from '../harnesses/hookHarness';

// Usage
const harness = new HookHarness();
harness.mockUiSlice({
  isInspectorOpen: true,
  activeSnapshotId: 'snapshot1',
  // ...other UI state
});
harness.mockMetricsSlice({
  // Mock metrics state
});

const { result } = renderHook(() => useInspectorProps(), {
  wrapper: harness.getWrapper()
});

expect(result.current).toEqual(expect.objectContaining({
  metricName: 'http.server.duration'
}));
```

Features:
- Mock Zustand stores
- React context providers
- Snapshot state initialization
- Event bus mock

### UI Component Test Harness

Located in `tests/harnesses/componentHarness.tsx`, provides:

```ts
import { ComponentHarness } from '../harnesses/componentHarness';
import { DataPointInspectorDrawer } from '@/ui/organisms/DataPointInspectorDrawer';

// Usage
const harness = new ComponentHarness();
const props = harness.createInspectorProps({
  metricName: 'http.server.duration',
  // customize specific properties
});

const { getByText, queryByText, fireEvent } = harness.render(
  <DataPointInspectorDrawer {...props} />
);

// Interact and assert
fireEvent.click(getByText('Simulate drop'));
expect(getByText('93.75% less')).toBeInTheDocument();
```

Features:
- Props factories for all components
- Theme context providers
- Interaction utilities
- Accessibility testing helpers

## Performance Testing

Each test harness includes performance measurement capabilities:

```ts
const harness = new ProcessorHarness();
harness.withLargeSnapshot(100000); // 100k series

const { duration, result } = harness.measurePerformance({
  iterations: 5,
  simulateDropAttributeKey: 'http.method'
});

expect(duration).toBeLessThan(40); // 40ms budget
```

## Visual Regression Testing

We use Storybook with the StoryshotTestHarness for visual regression:

```ts
import { StoryshotTestHarness } from '../harnesses/storyshotHarness';

// Usage
const harness = new StoryshotTestHarness();
harness.captureBaseline('CRingSvg/Default');
harness.captureBaseline('CRingSvg/HighCardinality');

// In CI pipeline
harness.compareWithBaseline('CRingSvg/Default', 0.1); // 0.1% tolerance
```

## Test Coverage Requirements

| Component | Line Coverage | Branch Coverage | Function Coverage |
|-----------|--------------|----------------|-------------------|
| Data Provider | 95% | 90% | 100% |
| Worker Utils | 95% | 95% | 100% |
| Processing | 100% | 100% | 100% |
| State Slices | 90% | 80% | 100% |
| Hooks | 80% | 70% | 100% |
| UI Components | 70% | 60% | 90% |

## Running Tests

```bash
# Run all tests
npm test

# Run specific test harness tests
npm test -- --testPathPattern=fileProvider

# Run performance tests (may take longer)
npm test -- --testPathPattern=performance

# Update visual snapshots
npm test -- -u

# Generate coverage report
npm test -- --coverage
```

## Mocking Best Practices

1. **Data Files**: Store test fixtures in `tests/fixtures/` as JSON files
2. **Event Bus**: Always use the provided mockEventBus from the harnesses
3. **Time-based Tests**: Use the timeMock utility for deterministic results
4. **Large Data**: Use the dataGenerators to create synthetic test data

## Adding New Tests

When adding tests for a new component:

1. Check if an existing harness meets your needs
2. If not, extend the appropriate base harness class
3. Add your test cases following the established patterns
4. Ensure you test both happy and error paths
5. For UI components, include accessibility assertions
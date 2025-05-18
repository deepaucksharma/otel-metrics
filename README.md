# Data-Point Inspector Drawer

A comprehensive, engineer-focused view of a single OTLP metric data point within its metric's cardinality context.

## Features

- Inspect data point's value, attributes, and schema details
- Understand data point's position within the metric's series
- Visualize attribute uniqueness landscape
- Simulate the impact of dropping attributes on cardinality

## Components

The drawer consists of the following key zones:

1. **Header** - Displays metric context (name, instrument, unit, schema)
2. **Value Zone** - Visualizes the data point's value(s)
3. **Attribute Zone** - Lists attributes with cardinality cues
4. **Cardinality Capsule** - Summarizes series count and attribute uniqueness
5. **Exemplars Zone** - Shows exemplar data if provided
6. **Raw JSON Zone** - Offers a collapsible raw data view

## Development

### Installation

```bash
npm install
```

### Running the Demo

```bash
npm start
```

This will start a development server and open the demo application in your default browser.

## Implementation Notes

- All data is passed via props; the drawer performs no fetching
- Component renders in <20ms, using only the provided props
- Drawer width is fixed at 660px
- Designed for static snapshot analysis

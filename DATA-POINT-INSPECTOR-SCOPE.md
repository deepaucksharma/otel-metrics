# Data-Point Inspector Drawer

## Project Overview

The Data-Point Inspector Drawer is a specialized UI component designed for observability platforms that handle OTLP (OpenTelemetry Protocol) metrics. It provides engineers with a detailed, context-rich view of individual metric data points, emphasizing cardinality visualization and schema comprehension within a static snapshot.

## Objectives

- **Enhance Metric Debugging**: Reduce the time engineers spend investigating metric anomalies by providing immediate context and detailed metadata.
- **Improve Cardinality Awareness**: Make the abstract concept of metric cardinality tangible and actionable through visual cues and interactive simulations.
- **Simplify Exploration**: Create a unified interface for exploring metric points, attributes, and exemplars in a single cohesive view.
- **Enable Optimization**: Provide insights that help engineers reduce unnecessary cardinality in their instrumentation.
- **Maintain Performance**: Deliver rich data visualizations without compromising application responsiveness.

## Scope

### In Scope

- A 660px slide-in panel that displays a comprehensive view of a single OTLP metric data point
- Visual representation of data point values that adapts to the metric type (gauge, counter, histogram)
- Attribute exploration with cardinality indicators
- Interactive cardinality simulation (what-if analysis for dropping attributes)
- Exemplar visualization when available
- Raw data view with copy functionality
- Static snapshot analysis (single point-in-time)

### Out of Scope

- Cross-snapshot comparisons
- Real-time updates
- Full metric series analysis
- Advanced filtering capabilities
- Complete accessibility conformance
 - Full filter management UI (drawer only triggers `onAddGlobalFilter`)

## Key Features

1. **Adaptive Value Visualization**
   - Radial gauges for gauge/upDownCounter metrics
   - Counter cards for monotonic sum metrics
   - Mini-distribution charts for histograms

2. **Cardinality Visualization System**
   - C-Ring: Visual indicator of series count vs threshold
   - B-MiniBars: Top contributors to cardinality
   - P-Rarity Dots: Attribute uniqueness indicators
   - Series Math Chip: Cardinality formula visualization
   - Simulate Drop: Interactive what-if analysis

3. **Attribute Exploration**
   - Two-column grid with key-value pairs
   - Visual cues for attribute significance
    - Copy and filter actions (calls `onAddGlobalFilter`; optional in v1.1)
   - Focus mode for highlighting related properties

4. **Exemplars Timeline** (within the `ExemplarsZone` component)
   - Temporal visualization of related traces
   - Value-based dot sizing
   - Direct access to trace exploration

5. **Raw JSON Access**
   - Collapsible view with syntax highlighting
   - Focused data point view by default
   - Expandable to see full context
   - Copy functionality

## User Experience Goals

- **Clarity**: Present complex metric relationships in an intuitive, visually clear manner
- **Efficiency**: Enable quick assessment of a data point's significance and context
- **Discoverability**: Surface important insights through progressive disclosure
- **Consistency**: Establish a visual language that reinforces understanding of metrics
- **Responsiveness**: Maintain sub-20ms render time for smooth user experience

## Technical Specifications

- **Component Architecture**: React-based with a clear component hierarchy
- **State Management**: Internal state using React hooks
- **Performance Budget**:
  - <20ms render time
  - <60ms mount to First Contentful Paint
  - <3kB SVG size (gzipped)
- **Dependencies**: No external chart libraries >30kB
- **Data Flow**: Prop-based with no internal fetching

## Success Metrics

- **Usage Rate**: >50% of engineers use the drawer when investigating metrics
- **Interaction Depth**: Average of at least 3 different zones used per session
- **Performance**: 95th percentile render time below 20ms
- **Simulation Actions**: >25% of sessions include attribute simulation
- **Feedback**: Positive qualitative feedback from 80% of engineering team

## Implementation Roadmap

### Phase 1: Core Functionality
- Basic drawer with header and value visualization
- Attribute listing
- Raw JSON view

### Phase 2: Cardinality Visualization
- C-Ring implementation
- B-MiniBars
- Attribute rarity indicators

### Phase 3: Interactive Features
- Attribute focus state
- Simulation mode
- Copy functionality

### Phase 4: Refinement
- Exemplars timeline integrated in `ExemplarsZone`
- Performance optimization
- Visual polish

## Assumptions & Constraints

### Assumptions
- All data is available at render time (no async loading)
- Cardinality calculations are performed outside this component
- Users understand basic OTLP metric concepts

### Constraints
- Fixed 660px width
- Static snapshot analysis only
- Limited to metrics within a single snapshot

## Integration Context

The Data-Point Inspector Drawer is designed to integrate with metric visualization dashboards, tables, and charts. It serves as a drill-down component triggered by user interaction with these higher-level components, providing detailed context for a selected data point.

Filter actions may invoke the host's `onAddGlobalFilter` callback to append a filter chip elsewhere in the interface. This callback is optional in version 1.1 and may be implemented in a later release.

---

**Version**: 1.0  
**Last Updated**: May 18, 2025  
**Status**: Implementation In Progress

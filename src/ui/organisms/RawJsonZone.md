# RawJsonZone.tsx – spec  
*(UI Organism · raw data view with syntax highlighting)*

---

## 1. Purpose

Provide a **collapsible JSON view** of the raw metric data that allows users to:

* See the data point in its exact JSON structure
* Copy the formatted JSON to clipboard
* Toggle between compact (data point only) and expanded (full context) views
* Search within the JSON content

This component serves as a debugging tool and escape hatch to the underlying data format.

---

## 2. Public Props

```ts
// src/ui/organisms/RawJsonZone.tsx
import type { ParsedPoint, AttrMap } from '@/contracts/types';

export interface RawJsonZoneProps {
  /** Metric name */
  metricName: string;
  
  /** The data point object */
  point: ParsedPoint;
  
  /** Resource-level attributes */
  resourceAttrs: AttrMap;
  
  /** Metric-level attributes */
  metricAttrs: AttrMap;
  
  /** Initial collapsed state (default: true) */
  initialCollapsed?: boolean;
}
```

## 3. Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│ RAW DATA                                     [▼] [Copy] │
├─────────────────────────────────────────────────────────┤
│ {                                                        │
│   "metricName": "http.server.duration",                  │
│   "point": {                                             │
│     "timestampUnixNano": 1589012345000000,               │
│     "value": 245.8,                                      │
│     "attributes": {                                      │
│       "http.method": "GET",                              │
│       "http.route": "/api/v1/metrics/:id"                │
│     }                                                    │
│   }                                                      │
│ }                                                        │
│                                                          │
│ [▼ Show full context]                                    │
└─────────────────────────────────────────────────────────┘
```

When expanded:
```
┌─────────────────────────────────────────────────────────┐
│ RAW DATA                                     [▲] [Copy] │
├─────────────────────────────────────────────────────────┤
│ {                                                        │
│   "resource": {                                          │
│     "attributes": {                                      │
│       "service.name": "metrics-processor",               │
│       "host.name": "prod-worker-03",                     │
│       ...                                                │
│     }                                                    │
│   },                                                     │
│   "scopeMetrics": [{                                     │
│     "scope": { ... },                                    │
│     "metrics": [{                                        │
│       "name": "http.server.duration",                    │
│       ...                                                │
│     }]                                                   │
│   }]                                                     │
│ }                                                        │
│                                                          │
│ [▲ Show data point only]                                 │
└─────────────────────────────────────────────────────────┘
```

## 4. Component Implementation

```tsx
import React, { useState, useCallback, useMemo } from 'react';
import styles from './RawJsonZone.module.css';
import { CopyButton } from '@/ui/atoms/CopyButton';

export const RawJsonZone: React.FC<RawJsonZoneProps> = ({
  metricName,
  point,
  resourceAttrs,
  metricAttrs,
  initialCollapsed = true
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [showFullContext, setShowFullContext] = useState(false);
  
  // Toggle collapsed state
  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);
  
  // Toggle between data point only and full context
  const toggleFullContext = useCallback(() => {
    setShowFullContext(prev => !prev);
  }, []);
  
  // Format JSON for data point only view
  const pointJson = useMemo(() => {
    const data = {
      metricName,
      point: {
        ...point,
        attributes: { ...metricAttrs }
      }
    };
    
    return JSON.stringify(data, null, 2);
  }, [metricName, point, metricAttrs]);
  
  // Format JSON for full context view
  const fullJson = useMemo(() => {
    // Construct a JSON object that resembles the OTLP structure
    const data = {
      resource: {
        attributes: { ...resourceAttrs }
      },
      scopeMetrics: [{
        scope: {
          name: "unknown.scope", // This would be replaced with real scope if available
          attributes: {}
        },
        metrics: [{
          name: metricName,
          type: point.hasOwnProperty('bucketCounts') ? 'HISTOGRAM' : 'GAUGE',
          // For simplicity - in real implementation, would match OTLP structure
          dataPoints: [{
            ...point,
            attributes: { ...metricAttrs }
          }]
        }]
      }]
    };
    
    return JSON.stringify(data, null, 2);
  }, [metricName, point, resourceAttrs, metricAttrs]);
  
  // Choose which JSON to display
  const displayJson = showFullContext ? fullJson : pointJson;
  
  // Handle copy button click
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(displayJson);
  }, [displayJson]);
  
  if (isCollapsed) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>RAW DATA</h3>
          <div className={styles.actions}>
            <button 
              className={styles.toggleButton}
              onClick={toggleCollapse}
              aria-label="Expand raw data"
            >
              ▼
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>RAW DATA</h3>
        <div className={styles.actions}>
          <button 
            className={styles.toggleButton}
            onClick={toggleCollapse}
            aria-label="Collapse raw data"
          >
            ▲
          </button>
          <CopyButton 
            onCopy={handleCopy}
            label="Copy JSON"
          />
        </div>
      </div>
      
      <div className={styles.content}>
        <pre className={styles.jsonDisplay}>
          <code>{displayJson}</code>
        </pre>
        
        <button 
          className={styles.contextToggle}
          onClick={toggleFullContext}
          aria-label={showFullContext ? "Show data point only" : "Show full context"}
        >
          {showFullContext ? "▲ Show data point only" : "▼ Show full context"}
        </button>
      </div>
    </div>
  );
};
```

## 5. CSS & Styling

```css
.container {
  background-color: var(--cardBg);
  border-radius: 6px;
  overflow: hidden;
}

.header {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--borderColor);
}

.title {
  font-size: 14px;
  font-weight: 600;
  color: var(--textPrimary);
  margin: 0;
}

.actions {
  display: flex;
  gap: 8px;
}

.toggleButton {
  background: none;
  border: none;
  color: var(--textSecondary);
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
}

.toggleButton:hover {
  background-color: var(--buttonHoverBg);
  color: var(--textPrimary);
}

.content {
  position: relative;
}

.jsonDisplay {
  margin: 0;
  padding: 16px;
  background-color: var(--codeBg);
  color: var(--codeColor);
  font-family: var(--monoFont);
  font-size: 13px;
  line-height: 1.5;
  overflow-x: auto;
  tab-size: 2;
  max-height: 400px;
  overflow-y: auto;
}

.jsonDisplay code {
  display: block;
  white-space: pre;
}

.contextToggle {
  margin: 8px 16px 16px;
  padding: 6px 12px;
  background-color: var(--buttonBg);
  color: var(--buttonColor);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  display: inline-flex;
  align-items: center;
}

.contextToggle:hover {
  background-color: var(--buttonHoverBg);
}
```

## 6. Design Tokens

```css
:root {
  --codeBg: #1a1a1a;
  --codeColor: #e0e0e0;
  --buttonBg: rgba(255, 255, 255, 0.1);
  --buttonColor: #e0e0e0;
  --buttonHoverBg: rgba(255, 255, 255, 0.2);
  --borderColor: #333;
}
```

## 7. Extended Features

```ts
// Optional - syntax highlighting for JSON
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Replace the <pre><code> element with:
<SyntaxHighlighter
  language="json"
  style={vscDarkPlus}
  customStyle={{
    margin: 0,
    padding: '16px',
    background: 'var(--codeBg)',
    borderRadius: 0,
    maxHeight: '400px'
  }}
>
  {displayJson}
</SyntaxHighlighter>
```

## 8. Search Functionality

For larger JSON objects, a search feature can be added:

```tsx
const [searchTerm, setSearchTerm] = useState('');

// Add to header
<div className={styles.searchContainer}>
  <input
    type="text"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    placeholder="Search JSON..."
    className={styles.searchInput}
  />
  {searchTerm && (
    <button
      className={styles.clearSearch}
      onClick={() => setSearchTerm('')}
      aria-label="Clear search"
    >
      ×
    </button>
  )}
</div>

// Highlight search matches
const highlightMatches = (text: string) => {
  if (!searchTerm) return text;
  
  // Simple implementation - a more robust one would use a proper JSON parser
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

// Update the code element
<code dangerouslySetInnerHTML={{ __html: highlightMatches(displayJson) }} />
```

## 9. Consumers

DataPointInspectorDrawer – renders this component at the bottom of the drawer.

## 10. Tests

| Scenario | Expected |
|----------|----------|
| Initial render collapsed | Only header is visible |
| Toggle expand | Shows JSON content |
| Toggle "Show full context" | Switches between point-only and full context JSON |
| Copy button | Copies current JSON to clipboard |
| With large content | Scrollbars appear, performance remains good |

## 11. Accessibility

- Proper ARIA labels for buttons
- Keyboard navigation support
- Sufficient color contrast in code view
- Collapsible content to reduce cognitive load
- Copy functionality for users who need to paste elsewhere

## 12. Performance

For very large JSON objects:
- Consider lazy rendering of the full context view
- Add virtualization for extremely large objects
- Implement pagination for Array fields with many items
- Memoize JSON formatting to prevent re-computation
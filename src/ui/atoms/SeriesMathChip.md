# SeriesMathChip.tsx – spec  
*(UI Atom · visualization of cardinality formula)*

---

## 1. Purpose

Render a **compact, formula-like visualization** showing how series cardinality
is calculated from attribute value combinations. It visually explains:

* Which attributes contribute to cardinality
* How their unique values multiply together
* The current total series count result

This helps users understand why cardinality is high and which attributes to potentially drop.

---

## 2. Public Props

```ts
// src/ui/atoms/SeriesMathChip.tsx

export interface SeriesMathChipProps {
  /** Ordered array of attribute keys that affect cardinality */
  attrKeys: string[];
  
  /** Map of attribute keys to their unique value counts */
  attrUniq: Record<string, number>;
  
  /** Current total series count */
  seriesCount: number;
  
  /** Optional highlighted attribute key */
  highlightKey?: string | null;
  
  /** Optional variant for styling */
  variant?: 'default' | 'compact' | 'expanded';
  
  /** Optional class name */
  className?: string;
}
```

## 3. Visual Appearance

Default variant:
```
┌──────────────────────────────────────────────────────┐
│ service.name(1) × host.name(8) × http.method(4) = 32 │
└──────────────────────────────────────────────────────┘
```

Compact variant (truncated to fit smaller spaces):
```
┌─────────────────────────────┐
│ service.name × ... × 32     │
└─────────────────────────────┘
```

Expanded variant (multiline, better for many attributes):
```
┌─────────────────────────────┐
│ service.name  (1)           │
│ × host.name   (8)           │
│ × http.method (4)           │
│ = 32 series                 │
└─────────────────────────────┘
```

## 4. Implementation

```tsx
import React, { useMemo } from 'react';
import styles from './SeriesMathChip.module.css';

export const SeriesMathChip: React.FC<SeriesMathChipProps> = ({
  attrKeys,
  attrUniq,
  seriesCount,
  highlightKey = null,
  variant = 'default',
  className,
}) => {
  // Filter for attributes that actually exist in attrUniq
  const validAttrKeys = useMemo(() => 
    attrKeys.filter(key => key in attrUniq),
    [attrKeys, attrUniq]
  );
  
  // For screen readers, construct detailed description
  const ariaLabel = useMemo(() => {
    if (validAttrKeys.length === 0) return `${seriesCount} total series`;
    
    const formula = validAttrKeys.map(key => 
      `${key} with ${attrUniq[key] || 1} values`
    ).join(' multiplied by ');
    
    return `Series cardinality: ${formula} equals ${seriesCount} total series`;
  }, [validAttrKeys, attrUniq, seriesCount]);
  
  if (variant === 'compact') {
    return (
      <div 
        className={`${styles.chip} ${styles.compact} ${className || ''}`}
        aria-label={ariaLabel}
      >
        {validAttrKeys.length > 0 ? (
          <>
            <span className={highlightKey === validAttrKeys[0] ? styles.highlight : ''}>
              {validAttrKeys[0]}
            </span>
            {validAttrKeys.length > 1 && (
              <span className={styles.operator}> × </span>
            )}
            {validAttrKeys.length > 1 && <span>...</span>}
            <span className={styles.equals}> × {seriesCount}</span>
          </>
        ) : (
          <span>{seriesCount} series</span>
        )}
      </div>
    );
  }
  
  if (variant === 'expanded') {
    return (
      <div 
        className={`${styles.chip} ${styles.expanded} ${className || ''}`}
        aria-label={ariaLabel}
      >
        {validAttrKeys.map((key, i) => (
          <div 
            key={key} 
            className={`${styles.row} ${highlightKey === key ? styles.highlight : ''}`}
          >
            {i > 0 && <span className={styles.operator}>×</span>}
            <span className={styles.attrKey}>{key}</span>
            <span className={styles.count}>({attrUniq[key] || 1})</span>
          </div>
        ))}
        <div className={styles.equals}>= {seriesCount} series</div>
      </div>
    );
  }
  
  // Default variant
  return (
    <div 
      className={`${styles.chip} ${className || ''}`}
      aria-label={ariaLabel}
    >
      {validAttrKeys.map((key, i) => (
        <React.Fragment key={key}>
          {i > 0 && <span className={styles.operator}>×</span>}
          <span 
            className={`${styles.attrPair} ${highlightKey === key ? styles.highlight : ''}`}
          >
            {key}({attrUniq[key] || 1})
          </span>
        </React.Fragment>
      ))}
      {validAttrKeys.length > 0 && (
        <span className={styles.equals}>= {seriesCount}</span>
      )}
      {validAttrKeys.length === 0 && (
        <span>{seriesCount} series</span>
      )}
    </div>
  );
};
```

## 5. CSS

```css
.chip {
  display: inline-flex;
  align-items: center;
  flex-wrap: nowrap;
  padding: 6px 10px;
  border-radius: 16px;
  background-color: var(--chipBgColor);
  font-family: var(--monoFont);
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: background-color 150ms ease;
}

.chip:hover {
  background-color: var(--chipHoverBgColor);
}

.attrPair {
  padding: 2px 4px;
  border-radius: 3px;
  transition: background-color 150ms ease;
}

.operator {
  margin: 0 4px;
  color: var(--chipOperatorColor);
  user-select: none;
}

.equals {
  margin-left: 6px;
  font-weight: 500;
  color: var(--chipEqualsColor);
  user-select: none;
}

.highlight {
  background-color: var(--highlightBgColor);
  border-radius: 4px;
  padding: 2px 4px;
}

.count {
  color: var(--chipCountColor);
  margin-left: 2px;
  user-select: none;
}

/* Compact variant */
.compact {
  padding: 4px 8px;
  font-size: 12px;
  max-width: 200px;
}

/* Expanded variant */
.expanded {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8px 12px;
  white-space: normal;
}

.expanded .row {
  display: flex;
  align-items: center;
  line-height: 1.6;
  padding: 2px 0;
  transition: background-color 150ms ease;
}

.expanded .attrKey {
  margin-right: 4px;
}

.expanded .highlight {
  width: 100%;
}

.expanded .operator {
  width: 14px;
  text-align: center;
  margin-right: 6px;
}

.expanded .equals {
  margin-top: 4px;
  margin-left: 14px;
  font-weight: 600;
}
```

## 6. Design Tokens

```css
:root {
  --chipBgColor: rgba(30, 30, 30, 0.7);
  --chipHoverBgColor: rgba(40, 40, 40, 0.8);
  --chipOperatorColor: #888;
  --chipCountColor: #aaa;
  --chipEqualsColor: #e0e0e0;
  --highlightBgColor: rgba(255, 200, 0, 0.2);
}
```

## 7. Truncation and Layout Logic

For long attribute lists, each variant handles truncation differently:

### Default Variant (Inline)
- Uses CSS `text-overflow: ellipsis` for text truncation
- Maintains the formula structure with all elements
- For 10+ attributes, consider using expanded variant

### Compact Variant
- Shows only the first attribute followed by "..."
- Ideal for headers or tight spaces
- Always shows the final series count

### Expanded Variant
- Shows each attribute on its own line
- Never truncates attribute names
- Handles any number of attributes gracefully

## 8. Highlighted State Behavior

When `highlightKey` is provided:
- The matching attribute is visually highlighted with a background color
- In default variant: only the specific attribute+count pair is highlighted
- In expanded variant: the entire row is highlighted
- In compact variant: only the first attribute is highlighted (if it matches)

## 9. Consumers

- **Primary**: CardinalityCapsule – renders this chip to explain the series math
- **Secondary**: InspectorHeader – may use compact variant in header
- **Secondary**: MetricInstanceWidget – may use in metric overview

## 10. Tests

```tsx
// Component rendering tests
test('renders with default variant', () => {
  const { getByText } = render(
    <SeriesMathChip
      attrKeys={['service.name', 'host.name']}
      attrUniq={{ 'service.name': 1, 'host.name': 8 }}
      seriesCount={8}
    />
  );
  
  expect(getByText('service.name(1)')).toBeInTheDocument();
  expect(getByText('host.name(8)')).toBeInTheDocument();
  expect(getByText('= 8')).toBeInTheDocument();
});

test('handles missing attributes gracefully', () => {
  const { getByText, queryByText } = render(
    <SeriesMathChip
      attrKeys={['service.name', 'missing.attr']}
      attrUniq={{ 'service.name': 1 }}
      seriesCount={1}
    />
  );
  
  expect(getByText('service.name(1)')).toBeInTheDocument();
  expect(queryByText('missing.attr')).not.toBeInTheDocument();
});

test('highlights correct attribute', () => {
  const { getByText } = render(
    <SeriesMathChip
      attrKeys={['service.name', 'host.name']}
      attrUniq={{ 'service.name': 1, 'host.name': 8 }}
      seriesCount={8}
      highlightKey="host.name"
    />
  );
  
  const highlightedElem = getByText('host.name(8)');
  expect(highlightedElem).toHaveClass('highlight');
  expect(getByText('service.name(1)')).not.toHaveClass('highlight');
});

test('truncates properly in compact mode', () => {
  const { getByText } = render(
    <SeriesMathChip
      attrKeys={['service.name', 'host.name', 'http.method']}
      attrUniq={{ 
        'service.name': 1, 
        'host.name': 8,
        'http.method': 4
      }}
      seriesCount={32}
      variant="compact"
    />
  );
  
  expect(getByText('service.name')).toBeInTheDocument();
  expect(getByText('...')).toBeInTheDocument();
  expect(getByText('× 32')).toBeInTheDocument();
});

test('handles empty attribute list', () => {
  const { getByText } = render(
    <SeriesMathChip
      attrKeys={[]}
      attrUniq={{}}
      seriesCount={123}
    />
  );
  
  expect(getByText('123 series')).toBeInTheDocument();
});
```

## 11. Accessibility

- Comprehensive aria-label describes the math formula for screen readers
- Color contrast ratio of 4.5:1 or higher for all text
- Scales properly with browser font size settings
- Tab order follows logical flow in expanded variant
- Animation effects respect reduced motion settings:

```css
@media (prefers-reduced-motion: reduce) {
  .chip, .attrPair, .row {
    transition: none;
  }
}
```

## 12. Edge Cases

| Scenario | Handling |
|----------|----------|
| Empty attrKeys | Shows just "{seriesCount} series" |
| Keys not in attrUniq | Filters them out before rendering |
| attrUniq value is 0 | Displays as "(1)" (fallback) |
| Very long attribute names | Ellipsis in default/compact, wraps in expanded |
| Many attributes (10+) | Works best with expanded variant |
| seriesCount changes | Re-renders with updated value |
| className provided | Merged with component classes |
| Mobile/small screens | Compact variant recommended |

## 13. Performance Considerations

- Uses `useMemo` for expensive calculations (aria-label, filtering)
- Avoids unnecessary re-renders:
  ```tsx
  export const SeriesMathChip = React.memo(({...props}) => {
    // implementation
  });
  ```
- Optimized CSS selectors for better rendering performance
- Low memory footprint (all styling in CSS, no large data structures)
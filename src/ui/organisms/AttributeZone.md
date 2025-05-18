# AttributeZone.tsx – spec  
*(UI Organism · attribute grid with cardinality indicators)*

---

## 1. Purpose

Display a **structured grid of attribute key-value pairs** from both resource and
metric attributes, with visual indicators for each attribute's contribution to
cardinality. The component enables users to:

* View all relevant metadata attributes for a metric data point
* See which attributes contribute most to cardinality
* Copy attribute values
* Focus on specific attributes to highlight their impact 
* Filter by attribute value (via callback)

---

## 2. Public Props

```ts
// src/ui/organisms/AttributeZone.tsx
import type { AttrMap } from '@/contracts/types';

export interface AttributeZoneProps {
  /** Resource-level attributes (from resource object) */
  resourceAttrs: AttrMap;
  
  /** Metric-level attributes (from data point) */
  metricAttrs: AttrMap;
  
  /** Map of attribute keys to unique-value counts */
  attrUniq: Record<string, number>;
  
  /** Currently focused attribute key (or null) */
  focusedAttrKey: string | null;
  
  /** Callback when attribute focus changes */
  onFocusAttr: (key: string | null) => void;
  
  /** Optional callback to add global filter for attribute */
  onAddGlobalFilter?: (key: string, value: string | number | boolean) => void;
}
```

## 3. Visual Structure

```
┌─────────────────────────────────────────────────────────┐
│ ATTRIBUTES (12)                                          │
├─────────────────────────────────────────────────────────┤
│ Resource (5)                                            │
├────────────────┬──────────────────────┬────────────────┤
│ service.name   │ metrics-processor    │ ● (1)  [Copy]  │
├────────────────┼──────────────────────┼────────────────┤
│ host.name      │ prod-worker-03       │ ●● (8) [Copy]  │
├────────────────┼──────────────────────┼────────────────┤
│                │                      │                │
│                │                      │                │
├─────────────────────────────────────────────────────────┤
│ Metric (7)                                              │
├────────────────┬──────────────────────┬────────────────┤
│ http.method    │ GET                  │ ●●● (4) [Copy] │
├────────────────┼──────────────────────┼────────────────┤
│ http.route     │ /api/v1/metrics/:id  │ ●●●● (64)[Copy]│
├────────────────┼──────────────────────┼────────────────┤
│                │                      │                │
└────────────────┴──────────────────────┴────────────────┘
```

## 4. Component Hierarchy

```tsx
<div className={styles.container}>
  <h3>ATTRIBUTES ({totalAttrCount})</h3>
  
  {resourceAttrs && Object.keys(resourceAttrs).length > 0 && (
    <>
      <h4>Resource ({Object.keys(resourceAttrs).length})</h4>
      <div className={styles.grid}>
        {Object.entries(resourceAttrs).map(([key, value]) => (
          <AttributeRow
            key={`res-${key}`}
            attrKey={key}
            attrValue={value}
            uniqueCount={attrUniq[key] || 1}
            isFocused={focusedAttrKey === key}
            onFocus={() => onFocusAttr(key)}
            onClear={() => onFocusAttr(null)}
            onCopy={() => handleCopy(key, value)}
            onAddFilter={onAddGlobalFilter ? 
              () => onAddGlobalFilter(key, value) : undefined}
          />
        ))}
      </div>
    </>
  )}
  
  {metricAttrs && Object.keys(metricAttrs).length > 0 && (
    <>
      <h4>Metric ({Object.keys(metricAttrs).length})</h4>
      <div className={styles.grid}>
        {Object.entries(metricAttrs).map(([key, value]) => (
          <AttributeRow
            key={`metric-${key}`}
            attrKey={key}
            attrValue={value}
            uniqueCount={attrUniq[key] || 1}
            isFocused={focusedAttrKey === key}
            onFocus={() => onFocusAttr(key)}
            onClear={() => onFocusAttr(null)}
            onCopy={() => handleCopy(key, value)}
            onAddFilter={onAddGlobalFilter ? 
              () => onAddGlobalFilter(key, value) : undefined}
          />
        ))}
      </div>
    </>
  )}
</div>
```

## 5. Interactions

| User Action | Result |
|-------------|--------|
| Click on attribute row | Sets focusedAttrKey to this attribute (via onFocusAttr) |
| Click on focused row | Clears focus (sets focusedAttrKey to null) |
| Click Copy button | Copies value to clipboard, shows brief success toast |
| Click Filter button | Calls onAddGlobalFilter(key, value) if provided |
| Hover on row | Light highlight effect on row |

## 6. State Management Approach

This component is primarily **stateless** and receives its state from the parent:

* `focusedAttrKey` is passed in from the parent (DataPointInspectorDrawer)
* Focus changes are bubbled up via `onFocusAttr` callback
* The only local state is for copy feedback:

```ts
const [copiedKey, setCopiedKey] = useState<string | null>(null);

const handleCopy = useCallback((key: string, value: AttrValue) => {
  navigator.clipboard.writeText(String(value));
  setCopiedKey(key);
  setTimeout(() => setCopiedKey(null), 1500);
}, []);
```

## 7. Child Component: AttributeRow

```ts
interface AttributeRowProps {
  attrKey: string;
  attrValue: AttrValue;
  uniqueCount: number;
  isFocused: boolean;
  onFocus: () => void;
  onClear: () => void;
  onCopy: () => void;
  onAddFilter?: () => void;
}
```

Renders a 3-column grid row with:
1. Key name (truncated with tooltip if too long)
2. Value (formatted appropriately for type)
3. Actions: RarityDot (shows uniqueCount), Copy button, Filter button (if onAddFilter provided)

## 8. Styling

```css
.container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grid {
  display: grid;
  grid-template-columns: minmax(140px, 30%) 1fr auto;
  gap: 4px;
  align-items: center;
}

.grid > div:nth-child(3n+1) {
  font-weight: 500;
  color: var(--attrKeyColor);
}

.grid > div:nth-child(3n+2) {
  font-family: var(--monoFont);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Focus state */
.rowFocused {
  background-color: var(--focusHighlightBg);
  outline: 1px solid var(--focusBorder);
}
```

## 9. Consumers

DataPointInspectorDrawer – renders this component and passes it resourceAttrs, metricAttrs, and cardinality.attrUniq.

## 10. Tests

| Scenario | Expected |
|----------|----------|
| Render with attributes | Shows correct sections and counts |
| Empty resource attributes | Resource section not rendered |
| Empty metric attributes | Metric section not rendered |
| Click on row | onFocusAttr called with key |
| Click Copy | Clipboard contains correct value |
| Missing onAddGlobalFilter | Filter button not rendered |

## 11. Performance

For large attribute sets (>50 keys), implement virtualization:

```ts
// Only if needed for large attribute sets
import { FixedSizeList } from 'react-window';

// Inside the component:
if (Object.keys(metricAttrs).length > 50) {
  return (
    <FixedSizeList 
      height={300}
      width="100%"
      itemCount={Object.keys(metricAttrs).length}
      itemSize={36}
    >
      {({ index, style }) => {
        const key = Object.keys(metricAttrs)[index];
        return (
          <AttributeRow
            style={style}
            attrKey={key}
            attrValue={metricAttrs[key]}
            // other props...
          />
        );
      }}
    </FixedSizeList>
  );
}
```

## 12. Accessibility

* Keyboard navigation between rows
* Focus indicators for interactive elements
* ARIA attributes for screen readers
* Tooltips for truncated values
* Clear visual feedback on focus states
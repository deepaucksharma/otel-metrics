# RawJsonZone.tsx – spec
*(UI Organism · collapsible view of point JSON)*

---

## 1. Purpose

Expose the raw OTLP JSON for the selected data point in
`DataPointInspectorDrawer`. Engineers can inspect the exact payload and
copy it for debugging. The zone is collapsed by default to keep the
Drawer focused on higher‑level visuals.

---

## 2. Public Props

```ts
interface RawJsonZoneProps {
  /** Parsed data point */
  point: ParsedPoint;
  /** Series resource attributes */
  resourceAttrs: AttrMap;
  /** Series metric attributes */
  metricAttrs: AttrMap;
}
```

## 3. Internal Behaviour

- Maintains `isOpen` state via `useState` to toggle visibility.
- When open, renders a `<pre>` block containing a minimal JSON object
  composed from `resourceAttrs`, `metricAttrs` and `point` fields.
- Syntax highlighting via a tiny PRISM snippet (or CSS tokens).
- Provides a `CopyButton` to copy the JSON string.
- Collapsed header displays row count / byte size as a summary.

Pseudo outline:

```tsx
const [open, setOpen] = useState(false);
return (
  <section className={styles.zone}>
    <header onClick={() => setOpen(o => !o)}>
      Raw JSON {open ? '▼' : '▶'}
      <CopyButton copyValue={jsonString}/>
    </header>
    {open && <pre>{jsonString}</pre>}
  </section>
);
```

## 4. Role within DataPointInspectorDrawer

Positioned at the bottom of the drawer, after the Exemplars Zone. It
receives props directly from `InspectorProps` and does not fetch or
mutate state. The drawer delegates all JSON copy interactions to this
organism.

## 5. Tests / Storybook
- Storybook: closed vs open, copy button works.
- RTL: JSON string contains attribute keys, toggling shows/hides block.

## 6. Performance
JSON string precomputed from props; rendering the `<pre>` block is
negligible compared to syntax highlighter (kept under 3 kB).

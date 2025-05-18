# uiSlice.ts – spec  
*(Global State nano-module · holds UI pointers & Inspector state)*

---

## 1. Purpose

Track **what the user is looking at**:

* which snapshot is "active" in the workbench,
* which metric / series / point is selected,
* whether the Inspector drawer is open,
* filter text on dashboard, etc.

No heavy data—just IDs and simple scalars → fast reactivity.

---

## 2. Slice Shape

```ts
interface UiSliceState {
  // Snapshot roles
  activeSnapshotId? : string | null;  // the one driving UMI & Inspector
  snapshotAId?      : string | null;  // optional baseline (dashboard)
  snapshotBId?      : string | null;  // optional comparison

  // Current metric & point focus
  inspectedMetricName?   : string | null;
  inspectedSeriesKey?    : SeriesKey | null;
  inspectedPointId?      : number | null;   // timestampUnixNano

  // Drawer visibility
  isInspectorOpen : boolean;

  // Dashboard search
  dashboardFilter : string;
  
  // Simulation state
  dropSimulation? : {
    attributeKey : string | null;
    isActive     : boolean;
  };
}

interface UiSliceActions {
  setActiveSnapshot(id: string | null): void;
  setSnapshotRoleA (id: string | null): void;
  setSnapshotRoleB (id: string | null): void;

  inspectMetric(metricName: string): void;
  inspectSeriesAndPoint(seriesKey: SeriesKey, pointId: number): void;

  openInspector(): void;
  closeInspector(): void;

  setDashboardFilter(text: string): void;
  
  /**
   * Toggle simulation of dropping an attribute for cardinality analysis.
   * @param key The attribute key to toggle dropping
   * @param drop True to simulate dropping, false to restore
   */
  toggleSimDrop(key: string, drop: boolean): void;

  resetUi(): void;
}
```

## 3. Typical Flow
Dashboard row click
inspectMetric('http.server.duration') + setActiveSnapshot('snap1')
→ MetricInstanceWidget renders.

Chart point click inside UMI
inspectSeriesAndPoint(seriesKey, ts) then openInspector().

Drawer close (ESC or ×)
Component calls closeInspector().

Attribute drop simulation in Inspector
User toggles "Simulate Drop" → toggleSimDrop(key, true)
→ MetricInstanceWidget gets updated via useDropSimulation hook.

## 4. Selectors

```ts
selectIsInspectorOpen(state)    → boolean
selectCurrentInspectionContext(state) → {
    snapshotId, metricName, seriesKey, pointId
}
selectDropSimulation(state) → { attributeKey, isActive } | undefined
```

All selectors memoised via zustand's shallow.

## 5. Implementation Sketch

```ts
export const useUiSlice = create<UiSliceState & UiSliceActions>()(
  immer((set) => ({
    // state
    isInspectorOpen: false,
    dashboardFilter: '',
    dropSimulation: undefined,

    // actions
    openInspector: () => set(s => { s.isInspectorOpen = true }),
    closeInspector:() => set(s => { s.isInspectorOpen = false }),
    inspectMetric :(m)=> set(s => { s.inspectedMetricName=m }),
    toggleSimDrop :(key, drop) => set(s => {
      if (drop) {
        s.dropSimulation = { attributeKey: key, isActive: true };
      } else {
        s.dropSimulation = undefined;
      }
    }),
    // ...rest omitted for brevity
  }))
);
```

## 6. Event Bus Integration
Listen
eventBus.on('ui.metric.inspectRequest', {metricName,snapshotId})
→ set active snapshot & metric.

eventBus.on('ui.cardinality.simulateDrop', {key, drop})
→ toggleSimDrop(key, drop)

Emit
Hooks/components may emit ui.inspector.openRequest but most directly call slice actions.

## 7. Tests
| Scenario | Expected |
|----------|----------|
| openInspector sets flag true | selector returns true |
| closeInspector resets to false | … |
| inspectSeriesAndPoint updates both fields | values accessible |
| toggleSimDrop with key=http.method, drop=true | dropSimulation.attributeKey === http.method |
| toggleSimDrop with drop=false | dropSimulation undefined |
| resetUi clears all nullable fields | all become null / defaults |

## 8. Persistence
None. UI state resets on full page reload; snapshots remain loaded via user action.

## 9. Future Additions
multi-select compare (array of seriesKeys)

theme toggle (dark/light)

Keep them optional so Inspector 1.1 contract stays stable.
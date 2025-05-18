import { describe, beforeEach, it, expect } from 'vitest';
import useUiSlice, {
  selectIsInspectorOpen,
  selectCurrentInspectionContext
} from '../src/state/uiSlice';

describe('uiSlice', () => {
  beforeEach(() => {
    useUiSlice.getState().resetUi();
  });

  it('openInspector sets flag true', () => {
    useUiSlice.getState().openInspector();
    expect(selectIsInspectorOpen(useUiSlice.getState())).toBe(true);
  });

  it('closeInspector resets to false', () => {
    useUiSlice.getState().openInspector();
    useUiSlice.getState().closeInspector();
    expect(selectIsInspectorOpen(useUiSlice.getState())).toBe(false);
  });

  it('inspectSeriesAndPoint updates fields', () => {
    useUiSlice.getState().inspectSeriesAndPoint('metric|a=b', 123);
    const ctx = selectCurrentInspectionContext(useUiSlice.getState());
    expect(ctx.seriesKey).toBe('metric|a=b');
    expect(ctx.pointId).toBe(123);
  });

  it('resetUi clears values', () => {
    useUiSlice.getState().openInspector();
    useUiSlice.getState().setDashboardFilter('foo');
    useUiSlice.getState().resetUi();
    const state = useUiSlice.getState();
    expect(state.isInspectorOpen).toBe(false);
    expect(state.dashboardFilter).toBe('');
  });
});

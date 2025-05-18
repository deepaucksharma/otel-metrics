import React from 'react';
import { renderHook } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { useInspectorProps } from '../src/hooks/useInspectorProps';
import useUiSlice from '../src/state/uiSlice';
import { useMetricsSlice } from '../src/state/metricsSlice';
import type { ParsedSnapshot } from '../src/contracts/types';

/** Minimal snapshot with one metric and point */
const snapshot: ParsedSnapshot = {
  id: 's1',
  fileName: 'f.json',
  ingestionTimestamp: 0,
  resources: [
    {
      resourceAttributes: {},
      scopes: [
        {
          metrics: [
            {
              definition: { name: 'm1', instrumentType: 'Gauge' },
              seriesData: new Map([
                [
                  'm1|',
                  {
                    seriesKey: 'm1|',
                    resourceAttributes: {},
                    metricAttributes: {},
                    points: [
                      {
                        timestampUnixNano: 1,
                        value: 1,
                        attributes: {},
                      },
                    ],
                  },
                ],
              ]),
            },
          ],
        },
      ],
    },
  ],
};

describe('useInspectorProps', () => {
  beforeEach(() => {
    useUiSlice.getState().resetUi();
    useMetricsSlice.getState().clearSnapshots();
    useMetricsSlice.getState().addSnapshot(snapshot);
    const ui = useUiSlice.getState();
    ui.setActiveSnapshot('s1');
    ui.inspectMetric('m1');
    ui.inspectSeriesAndPoint('m1|', 1);
    ui.openInspector();
  });

  it('provides setDashboardFilter as onAddGlobalFilter', () => {
    const { result } = renderHook(() => useInspectorProps());
    const ui = useUiSlice.getState();
    expect(result.current).not.toBeNull();
    expect(result.current!.onAddGlobalFilter).toBe(ui.setDashboardFilter);
  });
});

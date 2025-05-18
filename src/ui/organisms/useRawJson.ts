import { useState, useCallback, useMemo } from 'react';
import type { ParsedPoint, AttrMap } from '@/contracts/types';

export function useRawJson(
  metricName: string,
  point: ParsedPoint,
  resourceAttrs: AttrMap,
  metricAttrs: AttrMap,
  initialCollapsed = true
) {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [showFullContext, setShowFullContext] = useState(false);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const toggleFullContext = useCallback(() => {
    setShowFullContext(prev => !prev);
  }, []);

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

  const fullJson = useMemo(() => {
    const data = {
      resource: { attributes: { ...resourceAttrs } },
      scopeMetrics: [
        {
          scope: { name: 'unknown.scope', attributes: {} },
          metrics: [
            {
              name: metricName,
              type: (point as any).bucketCounts ? 'HISTOGRAM' : 'GAUGE',
              dataPoints: [
                {
                  ...point,
                  attributes: { ...metricAttrs }
                }
              ]
            }
          ]
        }
      ]
    };
    return JSON.stringify(data, null, 2);
  }, [metricName, point, resourceAttrs, metricAttrs]);

  const displayJson = showFullContext ? fullJson : pointJson;

  const getCopyValue = useCallback(() => displayJson, [displayJson]);

  return {
    isCollapsed,
    toggleCollapse,
    showFullContext,
    toggleFullContext,
    displayJson,
    getCopyValue
  };
}

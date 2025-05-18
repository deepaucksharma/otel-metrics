import { useState, useMemo, useCallback } from 'react';
import { ExemplarData } from '@/contracts/types';

export function useExemplarTimeline(
  exemplars: ExemplarData[],
  onExemplarClick?: (exemplar: ExemplarData) => void
) {
  const [selectedExemplar, setSelectedExemplar] = useState<ExemplarData | null>(
    null
  );

  const sortedExemplars = useMemo(
    () => [...exemplars].sort((a, b) => a.timeUnixNano - b.timeUnixNano),
    [exemplars]
  );

  const timeRange = useMemo(() => {
    if (sortedExemplars.length < 2) return null;
    const minTime = sortedExemplars[0].timeUnixNano;
    const maxTime = sortedExemplars[sortedExemplars.length - 1].timeUnixNano;
    return { minTime, maxTime, span: maxTime - minTime };
  }, [sortedExemplars]);

  const handleSelect = useCallback(
    (exemplar: ExemplarData) => {
      setSelectedExemplar(exemplar);
      onExemplarClick?.(exemplar);
    },
    [onExemplarClick]
  );

  const getPositionPercent = useCallback(
    (timestamp: number) => {
      if (!timeRange || timeRange.span === 0) return 0;
      return ((timestamp - timeRange.minTime) / timeRange.span) * 100;
    },
    [timeRange]
  );

  return {
    selectedExemplar,
    sortedExemplars,
    timeRange,
    handleSelect,
    getPositionPercent
  };
}

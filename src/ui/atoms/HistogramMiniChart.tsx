import React, { useMemo } from 'react';

/**
 * Compact histogram visualization for bucket distributions.
 *
 * Displays a minimal bar chart representing histogram buckets. Each bar height
 * is scaled relative to the maximum bucket count. Axis labels are generated from
 * the provided bucket boundaries and an optional unit. A bucket can be
 * highlighted for emphasis and an arbitrary reference value may be shown as a
 * vertical line.
 *
 * @remarks
 * ### Drawing algorithm
 * 1. Determine `maxCount` from the `buckets` array.
 * 2. Compute each bar height as `(count / maxCount) * 100`.
 * 3. Format `bounds` plus an `"inf"` label for axis text.
 * 4. Render bars inside a flex container using the computed heights.
 * 5. Apply highlight style when `highlightBucket` matches the bar index.
 * 6. If `referenceValue` is provided, position a line based on the value's
 *    proportion between bounds.
 *
 * ### Tests
 * - Basic render: bars scale to bucket counts.
 * - Empty buckets: zero-height bars.
 * - Single bucket: bar fills height.
 * - With unit: axis labels include the unit string.
 * - Different heights: container respects `height` prop.
 * - Bucket highlighting: selected bar uses highlight colour.
 * - Reference value: line appears at correct position.
 */
export interface HistogramMiniChartProps {
  /** Bucket counts from histogram metric. */
  buckets: number[];
  /** Bucket boundaries from histogram metric. */
  bounds: number[];
  /** Optional unit for axis labels. */
  unit?: string;
  /** Height of the chart area in pixels. Defaults to 60. */
  height?: number;
  /** Optional container class name. */
  className?: string;
  /** Index of bucket to highlight. */
  highlightBucket?: number;
  /** Optional value to overlay as a vertical reference line. */
  referenceValue?: number;
}

/** Compute a percentage position for a reference value within the bounds. */
function getPositionForValue(value: number, bounds: number[]): number {
  const extended = [...bounds, Infinity];
  for (let i = 0; i < extended.length; i++) {
    if (value < extended[i]) {
      const lower = i === 0 ? 0 : bounds[i - 1];
      const upper = extended[i];
      const fraction = upper === Infinity ? 1 : (value - lower) / (upper - lower);
      return ((i - 1 + fraction) / bounds.length) * 100;
    }
  }
  return 100;
}

export const HistogramMiniChart: React.FC<HistogramMiniChartProps> = ({
  buckets,
  bounds,
  unit = 'ms',
  height = 60,
  className,
  highlightBucket,
  referenceValue,
}) => {
  const maxCount = useMemo(() => Math.max(0, ...buckets), [buckets]);

  const barHeights = useMemo(
    () => buckets.map((c) => (maxCount === 0 ? 0 : (c / maxCount) * 100)),
    [buckets, maxCount]
  );

  const boundLabels = useMemo(() => {
    const labels = bounds.map((b) => `${b}${unit}`);
    labels.push('inf');
    return labels;
  }, [bounds, unit]);

  const refPos =
    referenceValue !== undefined ? getPositionForValue(referenceValue, bounds) : undefined;

  return (
    <div
      className={className}
      style={{ display: 'flex', flexDirection: 'column', width: '100%', height: height + 40 }}
    >
      <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-end', height }}>
        {barHeights.map((h, i) => (
          <div
            key={i}
            style={{
              height: `${h}%`,
              width: `${100 / buckets.length}%`,
              background: i === highlightBucket ? 'var(--histogramHighlightColor)' : 'var(--histogramBarColor)',
              margin: '0 1px',
              minHeight: 1,
            }}
            title={`${buckets[i]} items in ${boundLabels[i]} - ${boundLabels[i + 1]}`}
          />
        ))}
        {refPos !== undefined && (
          <div
            style={{
              position: 'absolute',
              left: `${refPos}%`,
              top: 0,
              bottom: 0,
              width: 2,
              background: 'var(--referenceLineColor)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>
      <div style={{ position: 'relative', height: 20, marginTop: 4 }}>
        {boundLabels.map((label, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${(i / (boundLabels.length - 1)) * 100}%`,
              transform: 'translateX(-50%)',
              fontSize: 11,
              color: 'var(--axisLabelColor)',
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

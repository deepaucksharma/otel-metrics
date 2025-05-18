import React from 'react';

/**
 * Visual timeline of exemplar events related to a selected metric point.
 *
 * @remarks
 * Each exemplar is shown as a dot along a horizontal timeline. Dots are ordered
 * by their `timeUnixNano` and sized relative to their `value` within the
 * provided array. Hovering a dot reveals its trace identifier and value via the
 * browser tooltip. The same text is exposed through `aria-label` for
 * screen readers.
 *
 * Consumers include {@link ExemplarsZone} inside the DataPointInspectorDrawer.
 *
 * Storybook showcases two variants:
 * - an empty timeline rendering a placeholder message;
 * - a populated timeline with 3–5 exemplar dots of varying sizes.
 */
export interface ExemplarData {
  /** Timestamp in Unix nanoseconds */
  timeUnixNano: number;
  /** Numeric value captured by the exemplar */
  value: number;
  /** Optional span identifier */
  spanId?: string;
  /** Optional trace identifier */
  traceId?: string;
  /** Additional attributes captured at the exemplar */
  attributes: Record<string, string | number | boolean>;
}

/**
 * Props for {@link ExemplarTimeline}.
 */
export interface ExemplarTimelineProps {
  /** Array of exemplar objects to render */
  exemplars: ExemplarData[];
}

/**
 * Renders a horizontal sequence of dots representing exemplar events.
 *
 * Dots are evenly spaced and scale from 4–12 px in diameter based on their
 * value. If no exemplars are provided, a small "No exemplars" placeholder is
 * shown.
 */
export const ExemplarTimeline: React.FC<ExemplarTimelineProps> = ({
  exemplars,
}) => {
  if (!exemplars.length) {
    return <div>No exemplars</div>;
  }

  const sorted = [...exemplars].sort(
    (a, b) => a.timeUnixNano - b.timeUnixNano
  );

  const values = sorted.map((e) => e.value);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const scale = (v: number) => {
    if (max === min) return 8;
    const ratio = (v - min) / (max - min);
    return 4 + ratio * 8; // 4–12 px
  };

  return (
    <ul className="exemplarTimeline" role="list" style={{ display: 'flex' }}>
      {sorted.map((e) => (
        <li
          key={e.timeUnixNano}
          style={{
            width: `${100 / sorted.length}%`,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              borderRadius: '50%',
              backgroundColor: '#666',
              width: `${scale(e.value)}px`,
              height: `${scale(e.value)}px`,
            }}
            title={e.traceId ? `${e.traceId} | ${e.value}` : `${e.value}`}
            aria-label={
              e.traceId
                ? `Exemplar value ${e.value}, trace ${e.traceId}`
                : `Exemplar value ${e.value}`
            }
          />
        </li>
      ))}
    </ul>
  );
};

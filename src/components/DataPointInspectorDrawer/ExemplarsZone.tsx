import React from 'react';

interface Exemplar {
  traceId: string;
  value: number;
  timestamp: string;
  attributes?: Record<string, string | number | boolean>;
}

interface NumberDataPoint {
  type: 'gauge' | 'upDownCounter' | 'monotonicSum';
  value: number;
  timestamp: string;
}

interface HistogramDataPoint {
  type: 'histogram';
  buckets: { bound: number; count: number }[];
  count: number;
  sum: number;
  timestamp: string;
}

interface ExemplarsZoneProps {
  exemplars: Exemplar[];
  point: NumberDataPoint | HistogramDataPoint;
}

export const ExemplarsZone: React.FC<ExemplarsZoneProps> = ({ exemplars, point }) => {
  // Parse timestamps to Date objects
  const parsedExemplars = exemplars.map(exemplar => ({
    ...exemplar,
    parsedTimestamp: new Date(exemplar.timestamp)
  }));
  
  // Sort exemplars by timestamp
  const sortedExemplars = [...parsedExemplars].sort(
    (a, b) => a.parsedTimestamp.getTime() - b.parsedTimestamp.getTime()
  );
  
  // Find min and max timestamps for scaling
  const minTime = sortedExemplars[0].parsedTimestamp.getTime();
  const maxTime = sortedExemplars[sortedExemplars.length - 1].parsedTimestamp.getTime();
  const timeRange = maxTime - minTime || 1; // Avoid division by zero
  
  // Find max value for dot sizing
  let maxValue = 0;
  if ('value' in point) {
    maxValue = point.value;
  } else if ('buckets' in point) {
    // For histograms, use the highest bucket bound
    const lastBucket = point.buckets[point.buckets.length - 1];
    maxValue = lastBucket?.bound || 0;
  }
  
  // Handle trace click
  const handleTraceClick = (traceId: string) => {
    // This would typically open the trace in a trace viewer
    console.log(`Opening trace: ${traceId}`);
    // openTrace(traceId) would be called here in a real implementation
  };

  return (
    <div className="exemplars-zone drawer-zone">
      <div className="exemplars-header">
        Exemplars ({exemplars.length})
      </div>
      
      <div className="exemplars-timeline">
        {sortedExemplars.map((exemplar, index) => {
          // Calculate position on the timeline
          const timePosition = ((exemplar.parsedTimestamp.getTime() - minTime) / timeRange) * 100;
          
          // Calculate dot size based on value (min 6px, max 12px)
          const value = exemplar.value || 0;
          const size = Math.max(6, Math.min(12, (value / maxValue) * 12));
          
          return (
            <div
              key={index}
              className="exemplar-dot"
              style={{
                left: `${timePosition}%`,
                top: '50%',
                width: `${size}px`,
                height: `${size}px`
              }}
              title={`Value: ${value}, Time: ${exemplar.timestamp}`}
              onClick={() => handleTraceClick(exemplar.traceId)}
            >
              <span className="visually-hidden">
                Exemplar with value {value} at {exemplar.timestamp}
              </span>
            </div>
          );
        })}
        
        {/* Timeline axis */}
        <div className="timeline-axis">
          <div className="timeline-start">
            {sortedExemplars[0]?.parsedTimestamp.toLocaleTimeString()}
          </div>
          <div className="timeline-end">
            {sortedExemplars[sortedExemplars.length - 1]?.parsedTimestamp.toLocaleTimeString()}
          </div>
        </div>
      </div>
      
      {/* Exemplar details tooltip (would be shown on hover in a real implementation) */}
      <div className="exemplar-tooltip" style={{ display: 'none' }}>
        <div className="exemplar-tooltip-header">
          <span className="exemplar-tooltip-value">Value: {exemplars[0]?.value}</span>
          <span className="exemplar-tooltip-time">Time: {exemplars[0]?.timestamp}</span>
        </div>
        <div className="exemplar-tooltip-attrs">
          {exemplars[0]?.attributes && 
            Object.entries(exemplars[0].attributes).map(([key, value]) => (
              <div key={key} className="exemplar-tooltip-attr">
                <span className="exemplar-attr-key">{key}:</span>
                <span className="exemplar-attr-value">{String(value)}</span>
              </div>
            ))
          }
        </div>
        <div className="exemplar-tooltip-trace">
          <button onClick={() => handleTraceClick(exemplars[0]?.traceId)}>
            Open Trace
          </button>
        </div>
      </div>
    </div>
  );
};

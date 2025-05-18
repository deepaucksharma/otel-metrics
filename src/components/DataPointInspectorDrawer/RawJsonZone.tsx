import React, { useState } from 'react';

interface AttrMap {
  [key: string]: string | number | boolean;
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

interface MetricDefinition {
  name: string;
  unit: string;
  instrument: 'gauge' | 'upDownCounter' | 'monotonicSum' | 'histogram';
  temporality: 'delta' | 'cumulative';
  monotonic?: boolean;
}

interface RawJsonZoneProps {
  point: NumberDataPoint | HistogramDataPoint;
  metric: MetricDefinition;
  seriesKey: string;
  metricAttrs: AttrMap;
  resourceAttrs: AttrMap;
}

export const RawJsonZone: React.FC<RawJsonZoneProps> = ({
  point,
  metric,
  seriesKey,
  metricAttrs,
  resourceAttrs
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Create the minimal JSON view (just the data point)
  const minimalJson = {
    point,
    metricAttrs
  };
  
  // Create the expanded JSON view (full context)
  const fullJson = {
    metric,
    seriesKey,
    point,
    metricAttrs,
    resourceAttrs
  };
  
  // Stringify the JSON with proper formatting
  const minimalJsonString = JSON.stringify(minimalJson, null, 2);
  const fullJsonString = JSON.stringify(fullJson, null, 2);
  
  // Function to copy JSON to clipboard
  const copyToClipboard = (json: string) => {
    navigator.clipboard.writeText(json)
      .then(() => {
        console.log('JSON copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy JSON: ', err);
      });
  };

  return (
    <details className="raw-json-zone">
      <summary className="raw-json-summary">
        Raw JSON
        <span className="raw-json-indicator">
          {isExpanded ? '▼' : '▶'}
        </span>
      </summary>
      
      <div className="raw-json-content">
        <pre>
          {isExpanded ? fullJsonString : minimalJsonString}
        </pre>
      </div>
      
      <div className="raw-json-actions">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="expand-context-btn"
        >
          {isExpanded ? '↙ collapse context' : '↗ expand context'}
        </button>
        
        <button
          onClick={() => copyToClipboard(isExpanded ? fullJsonString : minimalJsonString)}
          className="copy-json-btn"
        >
          📋 Copy JSON
        </button>
      </div>
    </details>
  );
};

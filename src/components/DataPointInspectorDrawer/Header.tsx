import React from 'react';

interface MetricDefinition {
  name: string;
  unit: string;
  instrument: 'gauge' | 'upDownCounter' | 'monotonicSum' | 'histogram';
  temporality: 'delta' | 'cumulative';
  monotonic?: boolean;
  latestN?: number[];
}

interface HeaderProps {
  metric: MetricDefinition;
  onClose: () => void;
  cardinality: number;
  thresholdHigh: number;
}

export const Header: React.FC<HeaderProps> = ({
  metric,
  onClose,
  cardinality,
  thresholdHigh
}) => {
  // Calculate the C-Ring fill percentage
  const fillPercentage = (cardinality / thresholdHigh) * 100;
  
  // Determine color based on threshold
  let ringColor = 'var(--ringGrey)';
  if (fillPercentage > 66) {
    ringColor = 'var(--ringRed)';
  } else if (fillPercentage > 33) {
    ringColor = 'var(--ringAmber)';
  }

  return (
    <div className="drawer-header">
      {/* Instrument Badge with C-Ring */}
      <svg className="instrument-badge" width="24" height="24" viewBox="0 0 24 24">
        <circle 
          cx="12" 
          cy="12" 
          r="10" 
          fill="none" 
          stroke={ringColor} 
          strokeWidth="2"
          strokeDasharray={`${(fillPercentage / 100) * 2 * Math.PI * 10} ${2 * Math.PI * 10}`}
        />
        
        {/* Add instrument type icon in the center */}
        {metric.instrument === 'gauge' && (
          <path 
            d="M12,6 L12,12 L16,16" 
            stroke="white" 
            strokeWidth="2" 
            fill="none"
            strokeLinecap="round"
          />
        )}
        {metric.instrument === 'histogram' && (
          <g fill="white">
            <rect x="8" y="14" width="2" height="4" />
            <rect x="11" y="12" width="2" height="6" />
            <rect x="14" y="10" width="2" height="8" />
          </g>
        )}
        {(metric.instrument === 'monotonicSum' || metric.instrument === 'upDownCounter') && (
          <text 
            x="12" 
            y="16" 
            textAnchor="middle" 
            fill="white" 
            fontSize="12"
          >
            {metric.instrument === 'monotonicSum' ? '+' : '±'}
          </text>
        )}
      </svg>
      
      {/* Metric Name */}
      <h3>{metric.name}</h3>
      
      {/* Unit Chip */}
      <span className="unit">
        {metric.unit === 'ms' && <span role="img" aria-label="clock">⏱️</span>}
        {metric.unit}
      </span>
      
      {/* Close Button */}
      <button className="close-button" onClick={onClose} aria-label="Close">
        ✕
      </button>
      
      {/* Semantic Strip */}
      <div className="semantic-strip">
        <span className="semantic-pill">
          {metric.instrument.charAt(0).toUpperCase() + metric.instrument.slice(1)}
          ({metric.temporality.toUpperCase()})
        </span>
        
        {metric.monotonic !== undefined && (
          <span className="semantic-pill">
            Monotonic {metric.monotonic ? '✓' : '✗'}
          </span>
        )}
        
        {/* Optional Micro-Trend if latestN is provided */}
        {metric.latestN && metric.latestN.length > 0 && (
          <svg 
            className="micro-trend" 
            width="80" 
            height="20" 
            viewBox="0 0 80 20"
            style={{ opacity: 0.5 }}
          >
            {/* Simple sparkline implementation */}
            {(() => {
              const values = metric.latestN;
              const max = Math.max(...values);
              const min = Math.min(...values);
              const range = max - min || 1;
              
              const points = values.map((val, i) => {
                const x = i * (80 / (values.length - 1 || 1));
                const y = 20 - ((val - min) / range * 18);
                return `${x},${y}`;
              }).join(' ');
              
              return (
                <polyline
                  points={points}
                  fill="none"
                  stroke="var(--metricBlue)"
                  strokeWidth="1.5"
                />
              );
            })()}
          </svg>
        )}
      </div>
    </div>
  );
};

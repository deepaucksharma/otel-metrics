import React from 'react';

interface MetricDefinition {
  name: string;
  unit: string;
  instrument: 'gauge' | 'upDownCounter' | 'monotonicSum' | 'histogram';
  temporality: 'delta' | 'cumulative';
  monotonic?: boolean;
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

interface ValueZoneProps {
  point: NumberDataPoint | HistogramDataPoint;
  metric: MetricDefinition;
}

export const ValueZone: React.FC<ValueZoneProps> = ({ point, metric }) => {
  // For number-based metrics (Gauge, Counter)
  if ('value' in point) {
    // For gauge or upDownCounter, use radial gauge
    if (point.type === 'gauge' || point.type === 'upDownCounter') {
      return (
        <div className="value-zone">
          <div className="radial-gauge">
            <svg width="180" height="180" viewBox="0 0 180 180">
              {/* Background arc */}
              <path
                d="M90,25 A65,65 0 1,1 89.99,25"
                fill="none"
                stroke="var(--ringGrey)"
                strokeWidth="4"
                strokeLinecap="round"
              />
              
              {/* Determine an appropriate scale for the gauge */}
              {(() => {
                // This is a simplified approach - in a real implementation,
                // we would use a more sophisticated scaling algorithm
                const value = point.value;
                const maxValue = Math.max(100, value * 1.2); // At least show up to 100 or 120% of current value
                
                // Calculate the sweep angle based on value/maxValue
                const sweepAngle = (value / maxValue) * 360;
                const startAngle = -180; // Start at the bottom
                const endAngle = startAngle + sweepAngle;
                
                // Convert angle to radians and calculate end point
                const endRad = (endAngle - 90) * (Math.PI / 180);
                const endX = 90 + 65 * Math.cos(endRad);
                const endY = 90 + 65 * Math.sin(endRad);
                
                // Create the filled arc
                const largeArcFlag = sweepAngle > 180 ? 1 : 0;
                const arcPath = `M90,155 A65,65 0 ${largeArcFlag},1 ${endX},${endY}`;
                
                return (
                  <>
                    <path
                      d={arcPath}
                      fill="none"
                      stroke="var(--metricBlue)"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    
                    {/* The needle */}
                    <line
                      x1="90"
                      y1="90"
                      x2={endX}
                      y2={endY}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                      strokeLinecap="round"
                      className="gauge-needle"
                    />
                    
                    {/* Center cap */}
                    <circle cx="90" cy="90" r="4" fill="#FFFFFF" />
                    
                    {/* Value text */}
                    <text
                      x="90"
                      y="120"
                      textAnchor="middle"
                      fill="#FFFFFF"
                      fontSize="16"
                      fontWeight="bold"
                    >
                      {point.value.toLocaleString(undefined, {
                        maximumFractionDigits: 2
                      })}
                    </text>
                    
                    {/* Unit text */}
                    <text
                      x="90"
                      y="136"
                      textAnchor="middle"
                      fill="#AAAAAA"
                      fontSize="12"
                    >
                      {metric.unit}
                    </text>
                  </>
                );
              })()}
            </svg>
          </div>
        </div>
      );
    }
    
    // For monotonic sum, use counter card
    if (point.type === 'monotonicSum') {
      return (
        <div className="value-zone">
          <div className="counter-card">
            <div className="value">
              {point.value > 9999999
                ? point.value.toExponential(2)
                : point.value.toLocaleString()}
            </div>
            <div className="label">since start</div>
          </div>
        </div>
      );
    }
  }
  
  // For histograms
  if ('buckets' in point) {
    return (
      <div className="value-zone">
        <div className="mini-distribution">
          <svg width="220" height="60" viewBox="0 0 220 60">
            {/* Calculate max count for scaling */}
            {(() => {
              const buckets = point.buckets;
              const maxCount = Math.max(...buckets.map(b => b.count));
              
              return (
                <>
                  {/* Render each bucket as a bar */}
                  {buckets.map((bucket, i) => {
                    const barWidth = 220 / buckets.length;
                    const barHeight = (bucket.count / maxCount) * 50;
                    const x = i * barWidth;
                    const y = 60 - barHeight;
                    
                    return (
                      <rect
                        key={i}
                        x={x}
                        y={y}
                        width={barWidth - 1}
                        height={barHeight}
                        fill="url(#histogramGradient)"
                        data-bound={bucket.bound}
                        data-count={bucket.count}
                      />
                    );
                  })}
                  
                  {/* X-axis */}
                  <line
                    x1="0"
                    y1="60"
                    x2="220"
                    y2="60"
                    stroke="#555555"
                    strokeWidth="1"
                  />
                  
                  {/* Define gradient for histogram bars */}
                  <defs>
                    <linearGradient
                      id="histogramGradient"
                      x1="0%"
                      y1="0%"
                      x2="0%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#1B78FF" />
                      <stop offset="100%" stopColor="#6EC4FF" />
                    </linearGradient>
                  </defs>
                </>
              );
            })()}
          </svg>
          
          {/* Total count and sum */}
          <div className="histogram-summary">
            <div>Count: {point.count.toLocaleString()}</div>
            <div>Sum: {point.sum.toLocaleString()}</div>
          </div>
        </div>
      </div>
    );
  }
  
  // Fallback for unknown metric types
  return (
    <div className="value-zone">
      <div>Unknown metric type</div>
    </div>
  );
};

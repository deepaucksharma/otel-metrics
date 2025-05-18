import React from 'react';

interface CardinalityCapsuleProps {
  cardinality: {
    seriesCount: number;
    attrUniq: Record<string, number>;
    attrRank: string[];
    attrOfPoint: string[];
    thresholdHigh: number;
  };
  focusedAttr: string | null;
  simulatedAttr: string | null;
  simulateMode: boolean;
}

export const CardinalityCapsule: React.FC<CardinalityCapsuleProps> = ({
  cardinality,
  focusedAttr,
  simulatedAttr,
  simulateMode
}) => {
  // Calculate the percentage fill for C-Ring
  const fillPercentage = (cardinality.seriesCount / cardinality.thresholdHigh) * 100;
  
  // Determine C-Ring color based on threshold
  let ringColor = 'var(--ringGrey)';
  if (fillPercentage > 66) {
    ringColor = 'var(--ringRed)';
  } else if (fillPercentage > 33) {
    ringColor = 'var(--ringAmber)';
  }
  
  // Get the top 5 attributes by uniqueness
  const topAttributes = cardinality.attrRank.slice(0, 5);
  
  // Find the maximum uniqueness value among top attributes for scaling
  const maxUniqueness = Math.max(...topAttributes.map(attr => cardinality.attrUniq[attr]));
  
  // Generate the series math chip text
  const generateSeriesMathText = () => {
    // In simulate mode, calculate what the cardinality would be without the simulated attribute
    if (simulateMode && simulatedAttr) {
      // Clone the attrUniq to avoid modifying the original
      const attrUniq = { ...cardinality.attrUniq };
      
      // Find all attributes except the simulated one
      const attrs = cardinality.attrRank.filter(attr => attr !== simulatedAttr);
      
      // Calculate the product
      const newSeriesCount = attrs.reduce((acc, attr) => acc * attrUniq[attr], 1);
      
      // Create the terms
      return (
        <>
          {attrs.map((attr, i) => (
            <React.Fragment key={attr}>
              <span 
                className={`series-math-term ${focusedAttr === attr ? 'focused' : ''}`}
                data-key={attr}
              >
                {attrUniq[attr]}
              </span>
              {i < attrs.length - 1 && ' × '}
            </React.Fragment>
          ))}
          <span> = {newSeriesCount}</span>
          <span className="series-reduction"> (reduced from {cardinality.seriesCount})</span>
        </>
      );
    }
    
    // Normal mode - show all attributes
    return (
      <>
        {cardinality.attrRank.map((attr, i) => (
          <React.Fragment key={attr}>
            <span 
              className={`series-math-term ${focusedAttr === attr ? 'focused' : ''}`}
              data-key={attr}
            >
              {cardinality.attrUniq[attr]}
            </span>
            {i < cardinality.attrRank.length - 1 && ' × '}
          </React.Fragment>
        ))}
        <span> = {cardinality.seriesCount}</span>
      </>
    );
  };

  return (
    <div className="cardinality-capsule drawer-zone">
      <div className="c-ring-container">
        {/* C-Ring visualization */}
        <svg className="c-ring" width="40" height="40" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="var(--ringGrey)"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke={ringColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(fillPercentage / 100) * 2 * Math.PI * 18} ${2 * Math.PI * 18}`}
            className={simulateMode ? 'simulated-ring' : ''}
          />
        </svg>
        
        {/* Series math visualization */}
        <div className="series-math-chip">
          {generateSeriesMathText()}
        </div>
      </div>
      
      {/* B-MiniBars for top attributes by uniqueness */}
      <ul className="b-mini-bars">
        {topAttributes.map(attr => {
          const uniqueness = cardinality.attrUniq[attr];
          const barWidth = (uniqueness / maxUniqueness) * 100;
          
          // Determine rarity color based on uniqueness relative to max
          let rarityColor = 'var(--rarityLo)';
          if (uniqueness / maxUniqueness > 0.66) {
            rarityColor = 'var(--rarityHi)';
          } else if (uniqueness / maxUniqueness > 0.33) {
            rarityColor = 'var(--rarityMid)';
          }
          
          return (
            <li 
              key={attr} 
              className={`b-mini-bar-item ${focusedAttr === attr ? 'focused' : ''}`}
              id={`mini-bar-${attr}`}
            >
              <div className="b-mini-bar-label">
                <span 
                  className="rarity-dot"
                  style={{ backgroundColor: rarityColor }}
                ></span>
                {attr}
              </div>
              <div className="b-mini-bar-track">
                <div 
                  className="b-mini-bar-fill"
                  style={{ width: `${barWidth}%`, backgroundColor: rarityColor }}
                ></div>
              </div>
              <div className="b-mini-bar-value">{uniqueness}</div>
            </li>
          );
        })}
      </ul>
      
      {/* Simulate Drop checkbox (only shown when an attribute is focused) */}
      {focusedAttr && (
        <div className="simulate-drop">
          <label>
            <input 
              type="checkbox"
              checked={simulateMode && simulatedAttr === focusedAttr}
              onChange={() => {/* This would be handled by the parent component */}}
            />
            Simulate dropping "{focusedAttr}"
          </label>
        </div>
      )}
    </div>
  );
};

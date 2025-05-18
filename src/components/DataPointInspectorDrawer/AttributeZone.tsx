import React from 'react';

interface AttrMap {
  [key: string]: string | number | boolean;
}

interface AttributeZoneProps {
  attributes: AttrMap;
  cardinality: {
    seriesCount: number;
    attrUniq: Record<string, number>;
    attrRank: string[];
    attrOfPoint: string[];
    thresholdHigh: number;
  };
  focusedAttr: string | null;
  onFocus: (key: string | null) => void;
  onSimulate: (key: string, simulate: boolean) => void;
  onAddGlobalFilter?: (k: string, v: string | number | boolean) => void;
}

export const AttributeZone: React.FC<AttributeZoneProps> = ({
  attributes,
  cardinality,
  focusedAttr,
  onFocus,
  onSimulate,
  onAddGlobalFilter
}) => {
  // Sort attributes by cardinality rank
  const sortedKeys = Object.keys(attributes).sort((a, b) => {
    const aRank = cardinality.attrRank.indexOf(a);
    const bRank = cardinality.attrRank.indexOf(b);
    
    // If both attributes are in the rank list, sort by rank
    if (aRank >= 0 && bRank >= 0) {
      return aRank - bRank;
    }
    
    // If only one is in the rank list, prioritize it
    if (aRank >= 0) return -1;
    if (bRank >= 0) return 1;
    
    // Default to alphabetical
    return a.localeCompare(b);
  });

  // Determine rarity level and dot size based on uniqueness
  const getRarityInfo = (key: string) => {
    if (!cardinality.attrUniq[key]) {
      return { level: 'low', size: '4px', color: 'var(--rarityLo)' };
    }
    
    const uniqueness = cardinality.attrUniq[key];
    const maxUniqueness = Math.max(...Object.values(cardinality.attrUniq));
    const ratio = uniqueness / maxUniqueness;
    
    if (ratio > 0.66) {
      return { level: 'high', size: '8px', color: 'var(--rarityHi)' };
    } else if (ratio > 0.33) {
      return { level: 'mid', size: '6px', color: 'var(--rarityMid)' };
    } else {
      return { level: 'low', size: '4px', color: 'var(--rarityLo)' };
    }
  };

  // Function to copy attribute value to clipboard
  const copyToClipboard = (value: string | number | boolean) => {
    navigator.clipboard.writeText(String(value))
      .then(() => {
        // Show a short-lived notification or toast
        console.log('Copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div className="attribute-zone drawer-zone">
      <div className="attribute-list">
        {sortedKeys.map(key => {
          const value = attributes[key];
          const { level, size, color } = getRarityInfo(key);
          const isHighlighted = focusedAttr === key;
          
          return (
            <div 
              key={key}
              className={`attribute-row ${isHighlighted ? 'focused' : ''}`}
              onClick={() => onFocus(key)}
            >
              <div className="attribute-key">
                <span 
                  className={`rarity-dot rarity-${level}`}
                  style={{ width: size, height: size, backgroundColor: color }}
                ></span>
                {key}
              </div>
              <div className="attribute-value">
                <span>{String(value)}</span>
                <div className="attribute-actions">
                  <button 
                    className="attribute-action-btn copy-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(value);
                    }}
                    title="Copy value"
                  >
                    📋
                  </button>
                  {onAddGlobalFilter && (
                    <button 
                      className="attribute-action-btn filter-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onAddGlobalFilter(key, value);
                      }}
                      title="Add as filter"
                    >
                      🔍
                    </button>
                  )}
                  {isHighlighted && (
                    <input 
                      type="checkbox"
                      onChange={(e) => {
                        e.stopPropagation();
                        onSimulate(key, e.target.checked);
                      }}
                      title="Simulate dropping this attribute"
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

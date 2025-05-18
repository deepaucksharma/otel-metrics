import React, { useState } from 'react';
import './DataPointInspectorDrawer.css';
import { Header } from './Header';
import { ValueZone } from './ValueZone';
import { AttributeZone } from './AttributeZone';
import { CardinalityCapsule } from './CardinalityCapsule';
import { ExemplarsZone } from './ExemplarsZone';
import { RawJsonZone } from './RawJsonZone';

// Define TypeScript interfaces as per specification
interface AttrMap {
  [key: string]: string | number | boolean;
}

interface Exemplar {
  traceId: string;
  value: number;
  timestamp: string;
  attributes?: AttrMap;
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
  latestN?: number[];  // Optional data for micro-trend
}

interface InspectorProps {
  /** Parsed from the snapshot JSON */
  metric: MetricDefinition;
  seriesKey: string;
  point: NumberDataPoint | HistogramDataPoint;
  resourceAttrs: AttrMap;
  metricAttrs: AttrMap;

  /** Local cardinality context */
  cardinality: {
    seriesCount: number;
    attrUniq: Record<string, number>;
    attrRank: string[];
    attrOfPoint: string[];
    thresholdHigh: number;
  };

  /** Exemplars (optional) */
  exemplars?: Exemplar[];

  /** Callbacks */
  onClose: () => void;
  onAddGlobalFilter?: (k: string, v: string | number | boolean) => void;
  onSimulateDrop?: (key: string, drop: boolean) => void;
}

// Main component
export const DataPointInspectorDrawer: React.FC<InspectorProps> = ({
  metric,
  seriesKey,
  point,
  resourceAttrs,
  metricAttrs,
  cardinality,
  exemplars,
  onClose,
  onAddGlobalFilter,
  onSimulateDrop
}) => {
  // Component state
  const [focusedAttr, setFocusedAttr] = useState<string | null>(null);
  const [simulateMode, setSimulateMode] = useState<boolean>(false);
  const [simulatedAttr, setSimulatedAttr] = useState<string | null>(null);
  
  // Handler for attribute focus
  const handleAttrFocus = (key: string | null) => {
    setFocusedAttr(key === focusedAttr ? null : key);
  };
  
  // Handler for simulation toggle
  const handleSimulateToggle = (key: string, simulate: boolean) => {
    if (simulate) {
      setSimulateMode(true);
      setSimulatedAttr(key);
      onSimulateDrop && onSimulateDrop(key, true);
    } else {
      setSimulateMode(false);
      setSimulatedAttr(null);
      onSimulateDrop && onSimulateDrop(key, false);
    }
  };
  
  // Computed state: combine resource and metric attributes
  const allAttributes = { ...resourceAttrs, ...metricAttrs };
  
  // Keyboard handler for Escape
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (focusedAttr) {
        setFocusedAttr(null);
      } else {
        onClose();
      }
    }
  };

  return (
    <div 
      id="drawer" 
      className={`data-point-inspector-drawer ${simulateMode ? 'simulate-mode' : ''}`}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <Header 
        metric={metric} 
        onClose={onClose} 
        cardinality={cardinality.seriesCount}
        thresholdHigh={cardinality.thresholdHigh}
      />
      
      <ValueZone 
        point={point} 
        metric={metric} 
      />
      
      <CardinalityCapsule 
        cardinality={cardinality}
        focusedAttr={focusedAttr}
        simulatedAttr={simulatedAttr}
        simulateMode={simulateMode}
      />
      
      <AttributeZone 
        attributes={allAttributes}
        cardinality={cardinality}
        focusedAttr={focusedAttr}
        onFocus={handleAttrFocus}
        onSimulate={handleSimulateToggle}
        onAddGlobalFilter={onAddGlobalFilter}
      />
      
      {exemplars && exemplars.length > 0 && (
        <ExemplarsZone 
          exemplars={exemplars} 
          point={point} 
        />
      )}
      
      <RawJsonZone 
        point={point}
        metric={metric}
        seriesKey={seriesKey}
        metricAttrs={metricAttrs}
        resourceAttrs={resourceAttrs}
      />
    </div>
  );
};

export default DataPointInspectorDrawer;

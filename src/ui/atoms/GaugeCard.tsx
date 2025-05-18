import React from 'react';
export interface GaugeCardProps { value: number; unit?: string; }
export const GaugeCard: React.FC<GaugeCardProps> = ({ value, unit }) => (
  <div data-testid="gauge-card">{value}{unit ? ` ${unit}` : ''}</div>
);
export default GaugeCard;

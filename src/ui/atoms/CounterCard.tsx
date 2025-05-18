import React from 'react';
export interface CounterCardProps { value: number; unit?: string; }
export const CounterCard: React.FC<CounterCardProps> = ({ value, unit }) => (
  <div data-testid="counter-card">{value}{unit ? ` ${unit}` : ''}</div>
);
export default CounterCard;

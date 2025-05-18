import React from 'react';
export interface HistogramMiniChartProps { buckets: number[]; bounds: number[]; }
export const HistogramMiniChart: React.FC<HistogramMiniChartProps> = () => (
  <div data-testid="histogram-chart">histogram</div>
);
export default HistogramMiniChart;

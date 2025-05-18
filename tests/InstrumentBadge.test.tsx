import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InstrumentBadge } from '../src/ui/atoms/InstrumentBadge';
import type { MetricDefinition } from '@intellimetric/contracts/types';

const types: MetricDefinition['instrumentType'][] = [
  'Gauge',
  'Sum',
  'Histogram',
  'Summary',
  'Unknown'
];

describe('InstrumentBadge', () => {
  types.forEach((t) => {
    it(`renders ${t} instrument`, () => {
      render(<InstrumentBadge type={t} />);
      expect(screen.getByLabelText(new RegExp(t, 'i'))).toBeInTheDocument();
    });
  });
});
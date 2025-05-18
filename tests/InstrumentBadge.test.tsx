import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InstrumentBadge } from '../src/ui/atoms/InstrumentBadge';

describe('InstrumentBadge', () => {
  it('renders an icon for the type', () => {
    render(<InstrumentBadge type="Histogram" />);
    const badge = screen.getByLabelText('Histogram');
    expect(badge.querySelector('svg')).toBeInTheDocument();
  });
});

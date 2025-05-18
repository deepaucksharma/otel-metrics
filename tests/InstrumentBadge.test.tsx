import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { InstrumentBadge } from '../src/ui/atoms/InstrumentBadge';

describe('InstrumentBadge', () => {
  it('renders the provided type', () => {
    render(<InstrumentBadge type="Histogram" />);
    expect(screen.getByText('Histogram')).toBeInTheDocument();
  });
});

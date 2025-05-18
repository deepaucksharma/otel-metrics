import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AttributeZone } from '../src/ui/organisms/AttributeZone';

const baseProps = {
  resourceAttrs: { env: 'prod' },
  metricAttrs: { method: 'GET' },
  attrUniq: { env: 2, method: 5 },
  focusedAttrKey: null as string | null,
};

describe('AttributeZone', () => {
  it('computes rarity percentage for each attribute', () => {
    const props = { ...baseProps, onFocusAttr: vi.fn() };
    render(<AttributeZone {...props} />);
    expect(screen.getByLabelText('occurs in 50.0% of series')).toBeInTheDocument();
    expect(screen.getByLabelText('occurs in 20.0% of series')).toBeInTheDocument();
  });

  it('calls onFocusAttr when row clicked', () => {
    const onFocusAttr = vi.fn();
    const props = {
      resourceAttrs: {},
      metricAttrs: { method: 'GET' },
      attrUniq: { method: 1 },
      focusedAttrKey: null,
      onFocusAttr,
    };
    render(<AttributeZone {...props} />);
    fireEvent.click(screen.getByText('method'));
    expect(onFocusAttr).toHaveBeenCalledWith('method');
  });

  it('calls onFocusAttr when row activated via keyboard', () => {
    const onFocusAttr = vi.fn();
    const props = {
      resourceAttrs: {},
      metricAttrs: { method: 'GET' },
      attrUniq: { method: 1 },
      focusedAttrKey: null,
      onFocusAttr,
    };
    render(<AttributeZone {...props} />);
    const row = screen.getByText('method').parentElement as HTMLElement;
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onFocusAttr).toHaveBeenCalledWith('method');
    onFocusAttr.mockClear();
    fireEvent.keyDown(row, { key: ' ' });
    expect(onFocusAttr).toHaveBeenCalledWith('method');
  });
});

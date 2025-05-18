/**
 * @file tests/AttributeZone.test.tsx
 * @summary AttributeZone.test module
 * @layer Tests
 * @remarks
 * Layer derived from Architecture-Principles.md.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AttributeZone } from '../src/ui/organisms/AttributeZone';

const baseProps = {
  resourceAttrs: { env: 'prod' },
  metricAttrs: { method: 'GET' },
  attrUniq: { env: 2, method: 5 },
  seriesCount: 10,
  focusedAttrKey: null as string | null,
  onAddGlobalFilter: undefined as any,
};

describe('AttributeZone', () => {
  it('computes rarity percentage for each attribute', () => {
    const props = { ...baseProps, onFocusAttr: vi.fn() };
    render(<AttributeZone {...props} />);
    expect(screen.getByLabelText('occurs in 20.0% of series')).toBeInTheDocument();
    expect(screen.getByLabelText('occurs in 50.0% of series')).toBeInTheDocument();
  });

  it('calls onFocusAttr when row clicked', () => {
    const onFocusAttr = vi.fn();
    const props = {
      resourceAttrs: {},
      metricAttrs: { method: 'GET' },
      attrUniq: { method: 1 },
      seriesCount: 10,
      focusedAttrKey: null,
      onAddGlobalFilter: undefined as any,
      onFocusAttr,
    };
    render(<AttributeZone {...props} />);
    fireEvent.click(screen.getByText('method'));
    expect(onFocusAttr).toHaveBeenCalledWith('method');
  });
});

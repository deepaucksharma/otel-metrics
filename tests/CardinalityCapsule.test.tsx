import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CardinalityCapsule } from '../src/ui/organisms/CardinalityCapsule';

describe('CardinalityCapsule', () => {
  it('calls onFocusAttr when mini-bar row activated via keyboard', () => {
    const onFocusAttr = vi.fn();
    render(
      <CardinalityCapsule
        seriesCount={10}
        baseSeriesCount={10}
        thresholdHigh={100}
        attrRank={['method']}
        attrUniq={{ method: 1 }}
        focusedAttrKey={null}
        onFocusAttr={onFocusAttr}
        onToggleDrop={vi.fn()}
        isDropSimActive={false}
        droppedKey={null}
      />
    );

    const row = screen.getByText('method').parentElement as HTMLElement;
    fireEvent.keyDown(row, { key: 'Enter' });
    expect(onFocusAttr).toHaveBeenCalledWith('method');
    onFocusAttr.mockClear();
    fireEvent.keyDown(row, { key: ' ' });
    expect(onFocusAttr).toHaveBeenCalledWith('method');
  });

  it('shows correct reduction percentage when drop simulation active', () => {
    render(
      <CardinalityCapsule
        seriesCount={60}
        baseSeriesCount={100}
        thresholdHigh={100}
        attrRank={['method']}
        attrUniq={{ method: 2 }}
        focusedAttrKey="method"
        onFocusAttr={vi.fn()}
        onToggleDrop={vi.fn()}
        isDropSimActive={true}
        droppedKey="method"
      />
    );
    expect(
      screen.getByText(/\u2192 60 series \(40% less\)/)
    ).toBeInTheDocument();
  });
});


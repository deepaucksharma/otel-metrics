import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RawJsonZone } from '../src/ui/organisms/RawJsonZone';
import type { ParsedPoint } from '@intellimetric/contracts/types';

describe('RawJsonZone', () => {
  it('copies JSON when copy button clicked', async () => {
    const point: ParsedPoint = {
      timestampUnixNano: 0,
      attributes: {},
      value: 1
    } as ParsedPoint;

    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });

    render(
      <RawJsonZone
        metricName="m"
        point={point}
        resourceAttrs={{}}
        metricAttrs={{}}
        initialCollapsed={false}
      />
    );

    fireEvent.click(screen.getByLabelText('Copy JSON'));

    expect(writeText).toHaveBeenCalled();
    expect(writeText.mock.calls[0][0]).toContain('"metricName"');
  });
});


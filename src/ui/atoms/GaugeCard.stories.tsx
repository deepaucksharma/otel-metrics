import type { Meta, StoryObj } from '@storybook/react';
import { GaugeCard } from './GaugeCard';

const meta: Meta<typeof GaugeCard> = {
  title: 'Atoms/GaugeCard',
  component: GaugeCard,
};
export default meta;

type Story = StoryObj<typeof GaugeCard>;

export const Basic: Story = {
  args: { value: 42, unit: 'ms' },
};

export const WithColorRanges: Story = {
  args: {
    value: 75,
    unit: 'ms',
    max: 100,
    ranges: [
      { value: 50, color: '#4ade80' },
      { value: 80, color: '#facc15' },
      { value: 100, color: '#ef4444' },
    ],
  },
};

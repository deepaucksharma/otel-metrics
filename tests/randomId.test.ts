import { describe, it, expect, vi } from 'vitest';
import { randomId } from '../src/utils/randomId';

describe('randomId', () => {
  it('uses crypto.randomUUID when available', () => {
    const original = globalThis.crypto;
    const mock = vi.fn().mockReturnValue('abc-123');
    (globalThis as any).crypto = { ...original, randomUUID: mock, getRandomValues: original?.getRandomValues };

    const id = randomId();
    expect(id).toBe('abc-123');
    expect(mock).toHaveBeenCalled();
    (globalThis as any).crypto = original;
  });

  it('falls back when randomUUID is missing', () => {
    const original = globalThis.crypto;
    (globalThis as any).crypto = { getRandomValues: vi.fn() };

    const id = randomId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);

    (globalThis as any).crypto = original;
  });
});
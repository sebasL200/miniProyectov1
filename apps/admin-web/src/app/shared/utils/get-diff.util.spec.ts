import { describe, expect, it } from 'vitest';
import { getDiff } from './get-diff.util';

describe('getDiff', () => {
  it('returns only the changed scalar properties', () => {
    expect(
      getDiff(
        {
          name: 'Nike',
          isActive: true,
          visibleInMenu: true,
        },
        {
          name: 'Adidas',
          isActive: true,
          visibleInMenu: false,
        },
      ),
    ).toEqual({
      name: 'Adidas',
      visibleInMenu: false,
    });
  });

  it('compares nested objects structurally', () => {
    expect(
      getDiff(
        {
          dimensions: { width: 10, height: 20 },
          tags: ['sale'],
        },
        {
          dimensions: { width: 10, height: 30 },
          tags: ['sale'],
        },
      ),
    ).toEqual({
      dimensions: { width: 10, height: 30 },
    });
  });
});

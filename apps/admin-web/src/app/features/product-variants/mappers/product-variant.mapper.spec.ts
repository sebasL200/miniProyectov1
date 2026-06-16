import { describe, expect, it } from 'vitest';
import { toProductVariant } from './product-variant.mapper';

describe('toProductVariant', () => {
  it('maps variant weight as text without weightUnit', () => {
    const variant = toProductVariant({
      id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b601',
      product: {
        id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b501',
        name: 'Product',
        slug: 'product',
      },
      sku: 'SKU-12345',
      price: '10.50',
      stockQuantity: 5,
      minimumStock: 1,
      dimensions: {
        weight: '0.24 kg',
        weightUnit: 'kg',
        packaging: {
          unit: 'cm',
          depth: 22,
          width: 28,
          height: 2,
        },
      },
      isActive: true,
      imageUrls: [],
      directAttributes: [],
      attributes: [],
      attributeValues: [],
      createdAt: null,
      updatedAt: null,
    });

    expect(variant.dimensions).toEqual({
      weight: '0.24 kg',
      packaging: {
        unit: 'cm',
        depth: 22,
        width: 28,
        height: 2,
      },
    });
    expect(variant.dimensions).not.toHaveProperty('weightUnit');
  });
});

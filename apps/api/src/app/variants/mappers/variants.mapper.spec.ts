import { toVariantDto } from './variants.mapper';

describe('variants mapper', () => {
  it('maps product brand when the variant product has one', () => {
    const variant = toVariantDto({
      id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b601',
      product: {
        id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b501',
        name: 'Product',
        slug: 'product',
        brand: {
          id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b401',
          name: 'Brand',
          slug: 'brand',
        },
      },
      sku: 'SKU-12345',
      price: '10.50',
      stockQuantity: 5,
      minimumStock: 1,
      barcodeGtin: null,
      descriptionHtml: null,
      offerPrice: null,
      offerStart: null,
      offerEnd: null,
      dimensions: {},
      isActive: true,
      imageUrls: [],
      createdAt: new Date('2026-04-13T00:00:00.000Z'),
      updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    });

    expect(variant.product).toEqual({
      id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b501',
      name: 'Product',
      slug: 'product',
      brand: {
        id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b401',
        name: 'Brand',
        slug: 'brand',
      },
    });
  });

  it('omits product brand when the variant product has no brand', () => {
    const variant = toVariantDto({
      id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b601',
      product: {
        id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b501',
        name: 'Product',
        slug: 'product',
        brand: null,
      },
      sku: 'SKU-12345',
      price: '10.50',
      stockQuantity: 5,
      minimumStock: 1,
      barcodeGtin: null,
      descriptionHtml: null,
      offerPrice: null,
      offerStart: null,
      offerEnd: null,
      dimensions: {},
      isActive: true,
      imageUrls: [],
      createdAt: new Date('2026-04-13T00:00:00.000Z'),
      updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    });

    expect(variant.product).toEqual({
      id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b501',
      name: 'Product',
      slug: 'product',
    });
  });

  it('maps variant weight as text and hides historical weightUnit', () => {
    const variant = toVariantDto({
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
      barcodeGtin: null,
      descriptionHtml: null,
      offerPrice: null,
      offerStart: null,
      offerEnd: null,
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
      createdAt: new Date('2026-04-13T00:00:00.000Z'),
      updatedAt: new Date('2026-04-13T00:00:00.000Z'),
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

  it('omits historical numeric variant weight', () => {
    const variant = toVariantDto({
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
      barcodeGtin: null,
      descriptionHtml: null,
      offerPrice: null,
      offerStart: null,
      offerEnd: null,
      dimensions: { weight: 0.24, weightUnit: 'kg' },
      isActive: true,
      imageUrls: [],
      createdAt: new Date('2026-04-13T00:00:00.000Z'),
      updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    });

    expect(variant.dimensions).toEqual({});
  });
});

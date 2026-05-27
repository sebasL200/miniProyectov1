import { toProductDto } from './products.mapper';

describe('products mapper', () => {
  it('maps product dimensions as strings without exposing historical weightUnit', () => {
    const product = toProductDto({
      id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b101',
      name: 'Product',
      slug: 'product',
      specificationsHtml: '<p>Specs</p>',
      shortDescription: 'Short',
      descriptionHtml: '<p>Description</p>',
      isActive: true,
      basePrice: 10.5,
      skuBase: '2026',
      isFeatured: false,
      dimensionsWeight: {
        weight: '0.24 kg',
        weightUnit: 'kg',
        length: '22 cm',
        width: '28 cm',
        height: '2 cm',
      },
      createdAt: new Date('2026-04-13T00:00:00.000Z'),
      updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    });

    expect(product.dimensionsBase).toEqual({
      weight: '0.24 kg',
      length: '22 cm',
      width: '28 cm',
      height: '2 cm',
    });
    expect(product.dimensionsBase).not.toHaveProperty('weightUnit');
  });

  it('omits historical numeric product weight', () => {
    const product = toProductDto({
      id: '018f4dc4-5f51-7c55-9b8f-15fbdd99b101',
      name: 'Product',
      slug: 'product',
      specificationsHtml: null,
      shortDescription: '',
      descriptionHtml: '<p>Description</p>',
      isActive: true,
      basePrice: 10.5,
      skuBase: '2026',
      isFeatured: false,
      dimensionsWeight: { weight: 0.24, weightUnit: 'kg' },
      createdAt: new Date('2026-04-13T00:00:00.000Z'),
      updatedAt: new Date('2026-04-13T00:00:00.000Z'),
    });

    expect(product.dimensionsBase).toEqual({});
  });
});

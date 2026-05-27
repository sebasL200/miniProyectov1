import {
  validateCreateVariantBody,
  validateListVariantsQuery,
  validateUpdateVariantBody,
} from './variants.validation';

describe('variants validation', () => {
  const validVariant = {
    productId: '018f4dc4-5f51-7c55-9b8f-15fbdd99b501',
    sku: 'SKU-12345',
    attributeValues: [],
  };

  it('accepts variant weight as a string with unit', () => {
    expect(
      validateCreateVariantBody({
        ...validVariant,
        dimensions: {
          weight: '0.24 kg',
          packaging: {
            unit: 'cm',
            depth: 22,
            width: 28,
            height: 2,
          },
        },
      }),
    ).toEqual({
      ...validVariant,
      price: undefined,
      minimumStock: 0,
      barcodeGtin: undefined,
      descriptionHtml: undefined,
      dimensions: {
        weight: '0.24 kg',
        packaging: {
          unit: 'cm',
          depth: 22,
          width: 28,
          height: 2,
        },
      },
      isActive: false,
      imageUrls: [],
      attributeIds: undefined,
      attributeValues: [],
    });
  });

  it('rejects numeric variant weight', () => {
    expect(() =>
      validateCreateVariantBody({
        ...validVariant,
        dimensions: { weight: 0.24 },
      }),
    ).toThrow('Invalid input');
  });

  it('rejects variant weightUnit', () => {
    expect(() =>
      validateCreateVariantBody({
        ...validVariant,
        dimensions: { weight: '0.24 kg', weightUnit: 'kg' },
      }),
    ).toThrow('Invalid input');
  });

  it('rejects variant weightUnit on update', () => {
    expect(() =>
      validateUpdateVariantBody({
        dimensions: { weight: '0.24 kg', weightUnit: 'kg' },
      }),
    ).toThrow('Invalid input');
  });

  it('parses list variant isActive query strings', () => {
    expect(
      validateListVariantsQuery({
        paginationType: 'offset',
        pageSize: '10',
        isActive: 'true',
      }),
    ).toEqual({
      paginationType: 'offset',
      productId: undefined,
      isActive: true,
      pageSize: 10,
      page: undefined,
      after: undefined,
      before: undefined,
    });

    expect(
      validateListVariantsQuery({
        paginationType: 'offset',
        pageSize: '10',
        isActive: 'false',
      }).isActive,
    ).toBe(false);
  });

  it('rejects invalid list variant isActive query values', () => {
    expect(() =>
      validateListVariantsQuery({
        paginationType: 'offset',
        pageSize: '10',
        isActive: 'yes',
      }),
    ).toThrow('Invalid input');
  });
});

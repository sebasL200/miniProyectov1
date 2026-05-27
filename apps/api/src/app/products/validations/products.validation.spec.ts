import {
  validateCreateBatchProductsBody,
  validateCreateProductBody,
  validateUpdateProductBody,
} from './products.validation';

describe('products validation', () => {
  const validProduct = {
    key: 'tmp-1',
    name: 'Product',
    modelYear: '2026',
    descriptionHtml: '<p>Description</p>',
    basePrice: 10.5,
    isActive: true,
    isFeatured: false,
    categoriesId: ['018f4dc4-5f51-7c55-9b8f-15fbdd99b102'],
  };

  it('validates batch product payloads', () => {
    expect(
      validateCreateBatchProductsBody({ products: [validProduct] }),
    ).toEqual({ products: [validProduct] });
  });

  it('accepts product weight as a string with unit', () => {
    expect(
      validateCreateProductBody({
        ...validProduct,
        dimensionsBase: { weight: '0.24 kg' },
      }),
    ).toEqual({
      ...validProduct,
      dimensionsBase: { weight: '0.24 kg' },
    });
  });

  it('rejects numeric product weight', () => {
    expect(() =>
      validateCreateProductBody({
        ...validProduct,
        dimensionsBase: { weight: 0.24 },
      }),
    ).toThrow('Invalid input');
  });

  it('rejects product weightUnit', () => {
    expect(() =>
      validateCreateProductBody({
        ...validProduct,
        dimensionsBase: { weight: '0.24 kg', weightUnit: 'kg' },
      }),
    ).toThrow('Invalid input');
  });

  it('rejects product weightUnit on update', () => {
    expect(() =>
      validateUpdateProductBody({
        dimensionsBase: { weight: '0.24 kg', weightUnit: 'kg' },
      }),
    ).toThrow('Invalid input');
  });

  it('rejects numeric product weight in batch items', () => {
    expect(() =>
      validateCreateBatchProductsBody({
        products: [
          {
            ...validProduct,
            dimensionsBase: { weight: 0.24 },
          },
        ],
      }),
    ).toThrow('Invalid input');
  });

  it('rejects missing products wrapper', () => {
    expect(() => validateCreateBatchProductsBody({})).toThrow('Invalid input');
  });

  it('rejects missing batch item keys', () => {
    expect(() =>
      validateCreateBatchProductsBody({
        products: [{ ...validProduct, key: '' }],
      }),
    ).toThrow('Invalid input');
  });

  it('rejects duplicate names in the same batch', () => {
    expect(() =>
      validateCreateBatchProductsBody({
        products: [
          validProduct,
          {
            ...validProduct,
            key: 'tmp-2',
          },
        ],
      }),
    ).toThrow('Invalid input');
  });
});

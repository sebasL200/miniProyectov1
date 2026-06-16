import { getProductVariantErrorMessage } from './product-variant-error-message.mapper';

describe('getProductVariantErrorMessage', () => {
  it('translates duplicate variant attribute combination errors', () => {
    const message = getProductVariantErrorMessage({
      error: {
        message: 'duplicate variant attribute combination',
      },
    });

    expect(message).toBe(
      'Ya existe una variante con la misma combinación de atributos y valores.',
    );
  });

  it('keeps unknown backend messages', () => {
    const message = getProductVariantErrorMessage({
      error: {
        message: 'El SKU ya existe.',
      },
    });

    expect(message).toBe('El SKU ya existe.');
  });

  it('returns null when the backend message is missing', () => {
    expect(getProductVariantErrorMessage({ error: {} })).toBeNull();
  });
});

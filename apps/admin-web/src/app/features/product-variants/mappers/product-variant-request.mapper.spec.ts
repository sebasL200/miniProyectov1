import { describe, expect, it } from 'vitest';
import { ProductVariantFormData } from '@product-variants/components/forms/product-variant-form/types';
import {
  productVariantFormChangesToUpdateVariantRequest,
  productVariantFormDataToCreateVariantRequest,
  productVariantFormDataToUpdateVariantRequest,
} from './product-variant-request.mapper';

describe('productVariantFormDataToCreateVariantRequest', () => {
  it('maps form data to the create variant payload with image data urls', () => {
    const imageUrl = 'data:image/png;base64,aW1hZ2U=';
    const formData: ProductVariantFormData = {
      product: {
        id: 'product-1',
        name: 'Producto',
        slug: 'producto',
      },
      name: 'Variante',
      sku: ' SKU-12345 ',
      price: 199.5,
      minimumStock: '2',
      barcode: '',
      description: '  ',
      isActive: false,
      images: [imageUrl],
      dimensions: {
        width: '',
        height: '20 cm',
        length: '30 cm',
        weight: ' 0.24 kg ',
      },
      attributes: [
        {
          id: 'attribute-color',
          name: 'Color',
          slug: 'color',
          isRequired: true,
        },
      ],
      attributeValues: [
        {
          attribute: {
            id: 'attribute-color',
            name: 'Color',
            slug: 'color',
            isRequired: true,
          },
          value: ' Black ',
        },
        {
          attribute: {
            id: 'attribute-size',
            name: 'Talla',
            slug: 'talla',
            isRequired: false,
          },
          value: '',
        },
      ],
    };

    expect(productVariantFormDataToCreateVariantRequest(formData)).toEqual({
      productId: 'product-1',
      sku: 'SKU-12345',
      price: '199.5',
      minimumStock: 2,
      barcodeGtin: undefined,
      descriptionHtml: undefined,
      dimensions: {
        weight: '0.24 kg',
        height: '20 cm',
        length: '30 cm',
      },
      isActive: false,
      imageUrls: [imageUrl],
      attributeValues: [
        {
          attributeId: 'attribute-color',
          value: 'Black',
        },
      ],
    });
  });

  it('maps empty optional update fields to clear payloads', () => {
    const formData: ProductVariantFormData = {
      product: {
        id: 'product-1',
        name: 'Producto',
        slug: 'producto',
      },
      name: 'Variante',
      sku: ' SKU-12345 ',
      price: null,
      minimumStock: '0',
      barcode: '',
      description: '',
      isActive: true,
      images: [],
      dimensions: {
        width: '',
        height: '',
        length: '',
        weight: '1 kg',
      },
      attributes: [],
      attributeValues: [],
    };

    expect(productVariantFormDataToUpdateVariantRequest(formData)).toEqual({
      sku: 'SKU-12345',
      minimumStock: 0,
      clearBarcodeGtin: true,
      clearDescriptionHtml: true,
      dimensions: {
        weight: '1 kg',
      },
      isActive: true,
      imageUrls: [],
      replaceImageUrls: true,
      attributeValues: [],
      replaceAttributeValues: true,
    });
  });
});

describe('productVariantFormChangesToUpdateVariantRequest', () => {
  const formData: ProductVariantFormData = {
    product: {
      id: 'product-1',
      name: 'Producto',
      slug: 'producto',
    },
    name: 'Variante',
    sku: 'SKU-99999',
    price: 299,
    minimumStock: '3',
    barcode: '',
    description: '<p>Nueva descripción</p>',
    isActive: false,
    images: ['data:image/png;base64,aW1hZ2U='],
    dimensions: {
      width: '10 cm',
      height: '20 cm',
      length: '30 cm',
      weight: '0.30 kg',
    },
    attributes: [
      {
        id: 'attribute-color',
        name: 'Color',
        slug: 'color',
        isRequired: true,
      },
    ],
    attributeValues: [
      {
        attribute: {
          id: 'attribute-color',
          name: 'Color',
          slug: 'color',
          isRequired: true,
        },
        value: 'Negro',
      },
    ],
  };

  it('maps only changed scalar fields to the update payload', () => {
    expect(
      productVariantFormChangesToUpdateVariantRequest(
        {
          sku: ' SKU-99999 ',
          description: '<p>Nueva descripción</p>',
        },
        formData,
      ),
    ).toEqual({
      sku: 'SKU-99999',
      descriptionHtml: '<p>Nueva descripción</p>',
    });
  });

  it('maps replacement flags only when their fields changed', () => {
    expect(
      productVariantFormChangesToUpdateVariantRequest(
        {
          images: formData.images,
          attributeValues: formData.attributeValues,
        },
        formData,
      ),
    ).toEqual({
      imageUrls: formData.images,
      replaceImageUrls: true,
      attributeValues: [
        {
          attributeId: 'attribute-color',
          value: 'Negro',
        },
      ],
      replaceAttributeValues: true,
    });
  });

  it('maps dimensions when weight or dimensions changed', () => {
    expect(
      productVariantFormChangesToUpdateVariantRequest(
        {
          dimensions: {
            ...formData.dimensions,
            weight: '0.30 kg',
          },
        },
        formData,
      ),
    ).toEqual({
      dimensions: {
        weight: '0.30 kg',
        height: '20 cm',
        width: '10 cm',
        length: '30 cm',
      },
    });
  });
});

import { describe, expect, it } from 'vitest';
import { ProductFormData } from '../components/forms/product-form/types';
import {
  productFormDataChangesToUpdateProductRequest,
  productFormDataToCreateProductRequest,
  productToProductFormData,
} from './product-request.mapper';
import { Product } from '../../../shared/models/product.model';

describe('productFormDataToCreateProductRequest', () => {
  it('keeps product weight as a string with its unit', () => {
    const request = productFormDataToCreateProductRequest({
      name: 'Product',
      modelYear: '2026',
      description: '<p>Description</p>',
      shortDescription: 'Short',
      basePrice: 10.5,
      isActive: true,
      isFeatured: false,
      weight: '0.24 kg',
      dimensions: {
        length: '22 cm',
        width: '28 cm',
        height: '2 cm',
      },
      categories: [{ id: 'category-id', name: 'Category', slug: 'category' }],
      attributes: [{ id: 'attribute-id', name: 'Material', slug: 'material' }],
      brandId: 'brand-id',
      sku: '',
      tags: [],
      metaTitle: '',
      metaDescription: '',
    } as ProductFormData);

    expect(request.dimensionsBase).toEqual({
      weight: '0.24 kg',
      length: '22 cm',
      width: '28 cm',
      height: '2 cm',
    });
    expect(request.dimensionsBase).not.toHaveProperty('weightUnit');
  });
});

describe('productToProductFormData', () => {
  it('uses direct attributes as editable attributes', () => {
    const product = {
      id: 'product-id',
      name: 'Product',
      slug: 'product',
      modelYear: '2026',
      descriptionHtml: '<p>Description</p>',
      descriptionShort: 'Short description',
      basePrice: 10,
      isActive: true,
      isFeatured: false,
      dimensionsBase: {
        weight: '1 kg',
        length: '10 cm',
        width: '20 cm',
        height: '30 cm',
      },
      categories: [{ id: 'category-id', name: 'Category', slug: 'category' }],
      directAttributes: [
        { id: 'direct-attribute-id', name: 'Color', slug: 'color' },
      ],
      attributes: [
        { id: 'category-attribute-id', name: 'Size', slug: 'size' },
        { id: 'direct-attribute-id', name: 'Color', slug: 'color' },
      ],
      variants: [],
      createdAt: null,
      updatedAt: null,
    } as Product;

    expect(productToProductFormData(product).attributes).toEqual([
      { id: 'direct-attribute-id', name: 'Color', slug: 'color' },
    ]);
  });
});

describe('productFormDataChangesToUpdateProductRequest', () => {
  it('maps changed product form fields to the update product contract', () => {
    const data = {
      name: 'Updated Product',
      modelYear: '2027',
      description: '<p>Updated description</p>',
      shortDescription: 'Updated short description',
      basePrice: 20,
      isActive: false,
      isFeatured: true,
      weight: '2 kg',
      dimensions: {
        length: '12 cm',
        width: '22 cm',
        height: '32 cm',
      },
      categories: [{ id: 'category-id', name: 'Category', slug: 'category' }],
      attributes: [{ id: 'attribute-id', name: 'Material', slug: 'material' }],
      brandId: 'brand-id',
      sku: 'ignored',
      tags: ['ignored'],
      metaTitle: 'Ignored',
      metaDescription: 'Ignored',
    } as ProductFormData;

    const request = productFormDataChangesToUpdateProductRequest(
      {
        name: data.name,
        dimensions: data.dimensions,
        categories: data.categories,
        attributes: data.attributes,
        sku: data.sku,
      },
      data,
    );

    expect(request).toEqual({
      name: 'Updated Product',
      dimensionsBase: {
        weight: '2 kg',
        length: '12 cm',
        width: '22 cm',
        height: '32 cm',
      },
      categoriesId: ['category-id'],
      attributeIds: ['attribute-id'],
    });
  });

  it('maps sku changes to the product modelYear API field', () => {
    const data = {
      name: 'Updated Product',
      modelYear: 'OLD-SKU',
      description: '<p>Updated description</p>',
      shortDescription: 'Updated short description',
      basePrice: 20,
      isActive: false,
      isFeatured: true,
      weight: '2 kg',
      dimensions: {
        length: '12 cm',
        width: '22 cm',
        height: '32 cm',
      },
      categories: [],
      attributes: [],
      brandId: 'brand-id',
      sku: 'NEW-SKU',
      tags: [],
      metaTitle: 'Ignored',
      metaDescription: 'Ignored',
    } as ProductFormData;

    expect(
      productFormDataChangesToUpdateProductRequest({ sku: data.sku }, data),
    ).toEqual({
      modelYear: 'NEW-SKU',
    });
  });
});

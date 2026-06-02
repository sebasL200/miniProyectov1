import { ProductFormData } from '../components/forms/product-form/types';
import { CreateProductDto, UpdateProductDto } from '@org/contracts';
import { Product } from '../../../shared/models';

export function productFormDataToCreateProductRequest(
  formData: ProductFormData,
): CreateProductDto {
  return {
    name: formData.name,
    modelYear: formData.sku || formData.modelYear,
    descriptionHtml: formData.description,
    descriptionShort: formData.shortDescription,
    basePrice: formData.basePrice ?? 0,
    isActive: formData.isActive,
    isFeatured: formData.isFeatured,
    dimensionsBase: {
      weight: formData.weight,
      ...formData.dimensions,
    },
    categoriesId: formData.categories.map((category) => category.id),
    attributeIds: formData.attributes.map((attribute) => attribute.id),
    brandId: formData.brandId || undefined,
  };
}

export function productToProductFormData(product: Product): ProductFormData {
  return {
    name: product.name,
    modelYear: product.modelYear.toString(),
    description: product.descriptionHtml,
    shortDescription: product.descriptionShort ?? '',
    basePrice: product.basePrice,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    weight: product.dimensionsBase.weight,
    dimensions: {
      length: product.dimensionsBase.length,
      width: product.dimensionsBase.width,
      height: product.dimensionsBase.height,
    },
    categories: product.categories,
    attributes: product.directAttributes,
    brandId: product.brand?.id ?? product.brandId ?? '',
    sku: product.modelYear.toString(),
    tags: [product.slug],
    metaTitle: product.name,
    metaDescription: product.descriptionShort ?? product.name,
  };
}

export function productFormDataChangesToUpdateProductRequest(
  changes: Partial<ProductFormData>,
  data: ProductFormData,
): UpdateProductDto {
  return {
    ...(changes.name !== undefined && { name: changes.name }),
    ...((changes.modelYear !== undefined || changes.sku !== undefined) && {
      modelYear:
        changes.sku !== undefined ? data.sku || data.modelYear : data.modelYear,
    }),
    ...(changes.description !== undefined && {
      descriptionHtml: changes.description,
    }),
    ...(changes.shortDescription !== undefined && {
      descriptionShort: changes.shortDescription,
    }),
    ...(changes.basePrice !== undefined && { basePrice: changes.basePrice ?? 0 }),
    ...(changes.isActive !== undefined && { isActive: changes.isActive }),
    ...(changes.isFeatured !== undefined && { isFeatured: changes.isFeatured }),
    ...((changes.weight !== undefined || changes.dimensions !== undefined) && {
      dimensionsBase: {
        weight: data.weight,
        ...data.dimensions,
      },
    }),
    ...(changes.categories !== undefined && {
      categoriesId: data.categories.map((category) => category.id),
    }),
    ...(changes.attributes !== undefined && {
      attributeIds: data.attributes.map((attribute) => attribute.id),
    }),
    ...(changes.brandId !== undefined && { brandId: changes.brandId }),
  };
}

import {
  CreateProductVariant,
  UpdateProductVariant,
} from '../services/product-variant-actions/types';
import { ProductVariantFormData } from '../components/forms/product-variant-form/types';
import { VariantDimensionsDto } from '@org/contracts';
import { AttributeProductVariantSummary } from '../types/attribute.type';
import { ProductVariant } from '../../../shared/models';

export function productVariantFormDataToCreateVariantRequest(
  data: ProductVariantFormData,
): CreateProductVariant {
  return {
    productId: data.product?.id ?? '',
    sku: data.sku.trim(),
    price: optionalDecimal(data.price),
    minimumStock: toInteger(data.minimumStock),
    barcodeGtin: optionalText(data.barcode),
    descriptionHtml: optionalText(data.description),
    dimensions: toVariantDimensions(data),
    isActive: data.isActive,
    imageUrls: data.images,
    attributeValues: toAttributeValuesPayload(data),
  };
}

export function productVariantFormDataToUpdateVariantRequest(
  data: ProductVariantFormData,
): UpdateProductVariant {
  return {
    sku: data.sku.trim(),
    ...pricePayload(data.price),
    minimumStock: toInteger(data.minimumStock),
    ...barcodePayload(data.barcode),
    ...descriptionPayload(data.description),
    dimensions: toVariantDimensions(data),
    isActive: data.isActive,
    imageUrls: data.images,
    replaceImageUrls: true,
    attributeValues: toAttributeValuesPayload(data),
    replaceAttributeValues: true,
  };
}

export function productVariantFormChangesToUpdateVariantRequest(
  changes: Partial<ProductVariantFormData>,
  data: ProductVariantFormData,
): UpdateProductVariant {
  return {
    ...(changes.sku !== undefined && { sku: changes.sku.trim() }),
    ...(changes.price !== undefined && pricePayload(changes.price)),
    ...(changes.minimumStock !== undefined && {
      minimumStock: toInteger(changes.minimumStock),
    }),
    ...(changes.barcode !== undefined && barcodePayload(changes.barcode)),
    ...(changes.description !== undefined &&
      descriptionPayload(changes.description)),
    ...(changes.dimensions !== undefined && {
      dimensions: toVariantDimensions(data),
    }),
    ...(changes.isActive !== undefined && { isActive: changes.isActive }),
    ...(changes.images !== undefined && {
      imageUrls: changes.images,
      replaceImageUrls: true,
    }),
    ...(changes.attributeValues !== undefined && {
      attributeValues: toAttributeValuesPayload(data),
      replaceAttributeValues: true,
    }),
  };
}

export function productVariantToProductVariantFormData(
  variant: ProductVariant,
): ProductVariantFormData {
  return {
    product: variant.product,
    name: `${variant.product.name} ${variant.sku}`,
    sku: variant.sku,
    price: variant.price ?? null,
    minimumStock: String(variant.minimumStock),
    barcode: variant.barcodeGtin ?? '',
    description: variant.descriptionHtml ?? '',
    isActive: variant.isActive,
    images: variant.imageUrls,
    dimensions: {
      width: variant.dimensions.width ?? '',
      height: variant.dimensions.height ?? '',
      length: variant.dimensions.length ?? '',
      weight: variant.dimensions.weight ?? '',
    },
    attributes: variant.attributes.map(toAttributeProductVariantSummary),
    attributeValues: variant.attributeValues.map((item) => ({
      attribute: toAttributeProductVariantSummary(item.attribute),
      value: item.value,
    })),
  };
}

function toVariantDimensions(
  data: ProductVariantFormData,
): VariantDimensionsDto {
  return {
    ...optionalDimension('width', data.dimensions.width),
    ...optionalDimension('height', data.dimensions.height),
    ...optionalDimension('length', data.dimensions.length),
    weight: (data.dimensions.weight ?? '').trim(),
  };
}

function optionalDimension(
  key: keyof Pick<VariantDimensionsDto, 'height' | 'width' | 'length'>,
  value: string | undefined,
): Partial<VariantDimensionsDto> {
  const trimmed = value?.trim() ?? '';
  return trimmed ? { [key]: trimmed } : {};
}

function optionalText(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function optionalDecimal(value: number | null): string | undefined {
  return value === null ? undefined : String(value);
}

function toInteger(value: string): number {
  return Number(value);
}

function toAttributeValuesPayload(data: ProductVariantFormData) {
  return data.attributeValues
    .map((item) => ({
      attributeId: item.attribute.id,
      value: item.value.trim(),
    }))
    .filter((item) => item.value.length > 0);
}

function barcodePayload(
  value: string,
): Pick<UpdateProductVariant, 'barcodeGtin' | 'clearBarcodeGtin'> {
  const trimmed = value.trim();
  return trimmed ? { barcodeGtin: trimmed } : { clearBarcodeGtin: true };
}

function descriptionPayload(
  value: string,
): Pick<UpdateProductVariant, 'descriptionHtml' | 'clearDescriptionHtml'> {
  const trimmed = value.trim();
  return trimmed
    ? { descriptionHtml: trimmed }
    : { clearDescriptionHtml: true };
}

function pricePayload(
  value: number | null,
): Pick<UpdateProductVariant, 'price'> {
  return value === null ? {} : { price: String(value) };
}

function toAttributeProductVariantSummary(attribute: {
  id: string;
  name: string;
  slug: string;
  isRequired?: boolean;
}): AttributeProductVariantSummary {
  return {
    id: attribute.id,
    name: attribute.name,
    slug: attribute.slug,
    isRequired: attribute.isRequired ?? false,
  };
}

import { ProductDto } from '@org/contracts';
import { ProductDimensionsDto } from '@org/contracts';
import type {
  AttributeSummaryDto,
  BrandSummaryDto,
  CategorySummaryDto,
  VariantReferenceSummaryDto,
} from '@org/contracts';

export interface ProductRow {
  id: string;
  name: string;
  slug: string;
  specificationsHtml: string | null;
  shortDescription: string;
  descriptionHtml: string;
  isActive: boolean;
  basePrice: number | string | { toNumber?: () => number };
  skuBase: string | null;
  isFeatured: boolean;
  dimensionsWeight: unknown;
  createdAt: Date;
  updatedAt: Date;
  brand?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  categories?: Array<{
    categoryId: string;
    category: {
      id: string;
      name: string;
      slug: string;
      attributes?: Array<{
        attribute: AttributeSummaryDto;
      }>;
    };
  }>;
  variants?: Array<{ id: string; sku: string }>;
}

function toNumber(value: ProductRow['basePrice']): number {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return Number(value);
  }
  if (value && typeof value.toNumber === 'function') {
    return value.toNumber();
  }
  return Number(value);
}

export function toProductDimensionsDto(value: unknown): ProductDimensionsDto {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const dimensions = value as Record<string, unknown>;
  const result: ProductDimensionsDto = {};
  for (const field of ['weight', 'length', 'width', 'height'] as const) {
    const fieldValue = dimensions[field];
    if (typeof fieldValue === 'string') {
      result[field] = fieldValue;
    }
  }
  return result;
}

export function toProductDto(
  row: ProductRow,
  options: {
    categories?: CategorySummaryDto[];
    variants?: VariantReferenceSummaryDto[];
    brand?: BrandSummaryDto;
    directAttributes?: AttributeSummaryDto[];
    attributes?: AttributeSummaryDto[];
  } = {},
): ProductDto {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    modelYear: row.skuBase ?? '',
    descriptionHtml: row.descriptionHtml,
    descriptionShort: row.shortDescription,
    specificationsHtml: row.specificationsHtml ?? undefined,
    basePrice: toNumber(row.basePrice),
    isActive: row.isActive,
    isFeatured: row.isFeatured,
    dimensionsBase: toProductDimensionsDto(row.dimensionsWeight),
    categories:
      options.categories ??
      row.categories?.map((category) => ({
        id: category.category.id,
        name: category.category.name,
        slug: category.category.slug,
      })) ??
      [],
    directAttributes: options.directAttributes ?? [],
    attributes: options.attributes ?? [],
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
    variants:
      options.variants ??
      row.variants?.map((variant) => ({
        id: variant.id,
        sku: variant.sku,
      })) ??
      [],
    brand:
      options.brand ??
      (row.brand
        ? {
            id: row.brand.id,
            name: row.brand.name,
            slug: row.brand.slug,
          }
        : undefined),
  };
}



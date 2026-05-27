import type { AttributeSummaryDto } from '@org/contracts';
import type { VariantAttributeValueDto } from '@org/contracts';
import type {
  VariantDto,
  VariantProductSummaryDto,
} from '@org/contracts';
import type { VariantDimensionsDto } from '@org/contracts';

export interface VariantRow {
  id: string;
  product: {
    id: string;
    name: string;
    slug: string;
    brand?: {
      id: string;
      name: string;
      slug: string;
    } | null;
  };
  sku: string;
  price: { toString: () => string } | string | null;
  stockQuantity?: number;
  minimumStock: number;
  barcodeGtin: string | null;
  descriptionHtml: string | null;
  offerPrice: { toString: () => string } | string | null;
  offerStart: Date | null;
  offerEnd: Date | null;
  dimensions: unknown;
  isActive: boolean;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  attributeValues?: Array<{
    attributeId: string;
    value: string;
    attribute?: {
      id: string;
      name: string;
      slug: string;
    };
  }>;
}

function decimalToString(
  value: VariantRow['price'] | VariantRow['offerPrice'],
): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }

  return typeof value === 'string' ? value : value.toString();
}

export function toVariantDimensionsDto(value: unknown): VariantDimensionsDto {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  const dimensions = value as Record<string, unknown>;
  const packagingValue = dimensions['packaging'];
  const nextDimensions: VariantDimensionsDto = {};

  for (const field of ['weight', 'length', 'width', 'height'] as const) {
    const fieldValue = dimensions[field];
    if (typeof fieldValue === 'string') {
      nextDimensions[field] = fieldValue;
    }
  }

  if (
    packagingValue &&
    typeof packagingValue === 'object' &&
    !Array.isArray(packagingValue)
  ) {
    const packaging = packagingValue as Record<string, unknown>;
    nextDimensions.packaging = {
      unit:
        typeof packaging['unit'] === 'string' ? packaging['unit'] : undefined,
      depth:
        typeof packaging['depth'] === 'number' ? packaging['depth'] : undefined,
      width:
        typeof packaging['width'] === 'number' ? packaging['width'] : undefined,
      height:
        typeof packaging['height'] === 'number'
          ? packaging['height']
          : undefined,
    };
  }

  return nextDimensions;
}

export function toVariantDto(
  row: VariantRow,
  options: {
    attributeValues?: VariantAttributeValueDto[];
    product?: VariantProductSummaryDto;
    directAttributes?: AttributeSummaryDto[];
    attributes?: AttributeSummaryDto[];
    stockQuantity?: number;
  } = {},
): VariantDto {
  return {
    id: row.id,
    product: options.product ?? {
      id: row.product.id,
      name: row.product.name,
      slug: row.product.slug,
      ...(row.product.brand
        ? {
            brand: {
              id: row.product.brand.id,
              name: row.product.brand.name,
              slug: row.product.brand.slug,
            },
          }
        : {}),
    },
    sku: row.sku,
    price: decimalToString(row.price),
    stockQuantity: options.stockQuantity ?? row.stockQuantity ?? 0,
    minimumStock: row.minimumStock,
    barcodeGtin: row.barcodeGtin ?? undefined,
    descriptionHtml: row.descriptionHtml ?? undefined,
    offerPrice: decimalToString(row.offerPrice),
    offerStart: row.offerStart ?? undefined,
    offerEnd: row.offerEnd ?? undefined,
    dimensions: toVariantDimensionsDto(row.dimensions),
    isActive: row.isActive,
    imageUrls: row.imageUrls ?? [],
    directAttributes: options.directAttributes ?? [],
    attributes: options.attributes ?? [],
    attributeValues:
      options.attributeValues ??
      row.attributeValues
        ?.filter((item) => item.attribute)
        .map((item) => ({
          attribute: {
            id: item.attribute!.id,
            name: item.attribute!.name,
            slug: item.attribute!.slug,
          },
          value: item.value,
        })) ??
      [],
    createdAt: row.createdAt ?? null,
    updatedAt: row.updatedAt ?? null,
  };
}



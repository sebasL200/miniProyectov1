import type {
  AttributeSummaryDto,
  BrandSummaryDto,
  CategorySummaryDto,
} from '../../../common/dto/output/entity-summary.dto.js';
import type { ProductDimensionsDto } from '../product-dimensions.dto.js';
import type { VariantDimensionsDto } from '../../../variants/dto/variant-dimensions.dto.js';

export type ProductDetailAttributeSummaryDto = AttributeSummaryDto & {
  isRequired?: boolean;
};

export interface ProductDetailVariantAttributeValueDto {
  attribute: ProductDetailAttributeSummaryDto;
  value: string;
}

export interface ProductDetailVariantDto {
  id: string;
  sku: string;
  price?: string;
  stockQuantity: number;
  minimumStock: number;
  barcodeGtin?: string;
  descriptionHtml?: string;
  offerPrice?: string;
  offerStart?: Date;
  offerEnd?: Date;
  dimensions: VariantDimensionsDto;
  isActive: boolean;
  imageUrls: string[];
  directAttributes: ProductDetailAttributeSummaryDto[];
  attributes: ProductDetailAttributeSummaryDto[];
  attributeValues: ProductDetailVariantAttributeValueDto[];
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ProductDetailDto {
  id: string;
  name: string;
  slug: string;
  modelYear: string;
  descriptionHtml: string;
  descriptionShort?: string;
  specificationsHtml?: string;
  basePrice: number;
  isActive: boolean;
  isFeatured: boolean;
  dimensionsBase: ProductDimensionsDto;
  categories: CategorySummaryDto[];
  directAttributes: ProductDetailAttributeSummaryDto[];
  attributes: ProductDetailAttributeSummaryDto[];
  variants: ProductDetailVariantDto[];
  brand?: BrandSummaryDto;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface ProductDetailResultDto {
  product: ProductDetailDto;
}

import type {
  AttributeSummaryDto,
  BrandSummaryDto,
  ProductSummaryDto,
} from '../../../common/dto/output/entity-summary.dto.js';
import type { VariantAttributeValueDto } from './variant-attribute-value.dto.js';
import type { VariantDimensionsDto } from '../variant-dimensions.dto.js';

export type VariantProductSummaryDto = ProductSummaryDto & {
  brand?: BrandSummaryDto;
};

export class VariantDto {
  id!: string;
  product!: VariantProductSummaryDto;
  sku!: string;
  price?: string;
  stockQuantity!: number;
  minimumStock!: number;
  barcodeGtin?: string;
  descriptionHtml?: string;
  offerPrice?: string;
  offerStart?: Date;
  offerEnd?: Date;
  dimensions!: VariantDimensionsDto;
  isActive!: boolean;
  imageUrls!: string[];
  directAttributes!: AttributeSummaryDto[];
  attributes!: AttributeSummaryDto[];
  attributeValues!: VariantAttributeValueDto[];
  createdAt!: Date | null;
  updatedAt!: Date | null;
}

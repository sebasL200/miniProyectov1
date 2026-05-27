import type { VariantAttributeValueInputDto } from './variant-attribute-value.dto.js';
import type { VariantDimensionsDto } from '../variant-dimensions.dto.js';

export class CreateVariantDto {
  productId!: string;
  sku!: string;
  price?: string;
  minimumStock?: number;
  barcodeGtin?: string;
  descriptionHtml?: string;
  dimensions?: VariantDimensionsDto;
  isActive?: boolean;
  imageUrls?: string[];
  attributeIds?: string[];
  attributeValues?: VariantAttributeValueInputDto[];
}

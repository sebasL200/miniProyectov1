import type { VariantAttributeValueInputDto } from './variant-attribute-value.dto.js';
import type { VariantDimensionsDto } from '../variant-dimensions.dto.js';

export class UpdateVariantDto {
  sku?: string;
  price?: string;
  minimumStock?: number;
  barcodeGtin?: string;
  clearBarcodeGtin?: boolean;
  descriptionHtml?: string;
  clearDescriptionHtml?: boolean;
  offerPrice?: string;
  clearOfferPrice?: boolean;
  offerStart?: string;
  clearOfferStart?: boolean;
  offerEnd?: string;
  clearOfferEnd?: boolean;
  dimensions?: VariantDimensionsDto;
  clearDimensions?: boolean;
  isActive?: boolean;
  imageUrls?: string[];
  attributeIds?: string[];
  attributeValues?: VariantAttributeValueInputDto[];
  replaceImageUrls?: boolean;
  replaceAttributeIds?: boolean;
  replaceAttributeValues?: boolean;
}

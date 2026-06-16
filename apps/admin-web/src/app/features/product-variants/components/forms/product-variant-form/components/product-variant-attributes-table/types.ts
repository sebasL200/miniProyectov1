import { ProductVariantAttributeValueFormData } from '../../types';
import { AttributeProductVariantSummary } from '@product-variants/types/attribute.type';

export interface ProductVariantAttributeTableRow {
  attribute: AttributeProductVariantSummary;
  order: number;
  value: string;
}

export type ProductVariantAttributeValue = ProductVariantAttributeValueFormData;

import { AttributeProductVariantSummary } from '@product-variants/types/attribute.type';
import { Product } from '@shared/models';

export interface ProductProductVariantSummary
  extends Omit<Product, 'attributes' | 'directAttributes'> {
  attributes: AttributeProductVariantSummary[];
  directAttributes: AttributeProductVariantSummary[];
}

import { ProductDimensionsDto } from '../product-dimensions.dto.js';

export class UpdateProductDto {
  name?: string;
  modelYear?: string;
  descriptionHtml?: string;
  descriptionShort?: string;
  specificationsHtml?: string;
  basePrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  dimensionsBase?: ProductDimensionsDto;
  categoriesId?: string[];
  attributeIds?: string[];
  brandId?: string;
}

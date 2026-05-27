import { ProductDimensionsDto } from '../product-dimensions.dto.js';

export class CreateProductDto {
  name!: string;
  modelYear!: string;
  descriptionHtml!: string;
  descriptionShort?: string;
  specificationsHtml?: string;
  basePrice!: number;
  isActive!: boolean;
  isFeatured!: boolean;
  dimensionsBase?: ProductDimensionsDto;
  categoriesId!: string[];
  attributeIds?: string[];
  brandId?: string;
}

export class CreateBatchProductDto extends CreateProductDto {
  key!: string;
}

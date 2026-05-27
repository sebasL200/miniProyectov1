import type {
  AttributeSummaryDto,
  BrandSummaryDto,
  CategorySummaryDto,
  VariantReferenceSummaryDto,
} from '../../../common/dto/output/entity-summary.dto.js';
import { ProductDimensionsDto } from '../product-dimensions.dto.js';

export class ProductDto {
  id!: string;
  name!: string;
  slug!: string;
  modelYear!: string;
  descriptionHtml!: string;
  descriptionShort?: string;
  specificationsHtml?: string;
  basePrice!: number;
  isActive!: boolean;
  isFeatured!: boolean;
  dimensionsBase!: ProductDimensionsDto;
  categories!: CategorySummaryDto[];
  directAttributes!: AttributeSummaryDto[];
  attributes!: AttributeSummaryDto[];
  createdAt!: Date | null;
  updatedAt!: Date | null;
  variants!: VariantReferenceSummaryDto[];
  brand?: BrandSummaryDto;
}

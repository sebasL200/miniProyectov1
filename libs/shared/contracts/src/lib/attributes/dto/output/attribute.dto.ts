import type { CategorySummaryDto } from '../../../common/dto/output/entity-summary.dto.js';

export interface AttributeDto {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder?: number;
  isActive: boolean;
  isFilterable: boolean;
  isRequired: boolean;
  appliesToAll: boolean;
  categories: CategorySummaryDto[];
  createdAt: Date | null;
  updatedAt: Date | null;
}
export interface AttributeWithCategoriesDto extends AttributeDto {}

import type { CategorySummaryDto } from '../../common/dto/output/entity-summary.dto.js';

export class CategoryDto {
  id!: string;
  name!: string;
  slug!: string;
  isActive!: boolean;
  visibleInMenu!: boolean;
  parent?: CategorySummaryDto;
  hasAttributes!: boolean;
  parentId?: string;
  parentName?: string;
  description?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  createdAt!: Date | null;
  updatedAt!: Date | null;
}

export class CategoryWithChildrenDto extends CategoryDto {
  children!: CategoryWithChildrenDto[];
}

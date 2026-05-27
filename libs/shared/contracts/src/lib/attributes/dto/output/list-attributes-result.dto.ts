import type { AttributeWithCategoriesDto } from './attribute.dto.js';

export interface ListAttributesResultDto {
  attributes: AttributeWithCategoriesDto[];
  totalCount?: number;
  totalPages?: number;
  nextCursor?: string | null;
  prevCursor?: string | null;
}

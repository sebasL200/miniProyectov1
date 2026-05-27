import { CategoryDto } from './category.dto.js';

export class ListCategoriesResultDto {
  categories!: (CategoryDto | null)[];
  totalCount?: number;
  totalPages?: number;
  nextCursor?: string;
  prevCursor?: string;
}

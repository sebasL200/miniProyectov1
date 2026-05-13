import { CategoryDto } from './category.dto';

export class ListCategoriesResultDto {
  categories!: (CategoryDto | null)[];
  totalCount?: number;
  totalPages?: number;
  nextCursor?: string;
  prevCursor?: string;
}

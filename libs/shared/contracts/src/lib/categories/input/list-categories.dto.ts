export class ListCategoriesQueryDto {
  parentId?: string;
  pageSize?: number;
  page?: number;
  rootOnly?: boolean;
  isActive?: boolean;
  order?: 'createdAt' | '-createdAt' | 'updatedAt' | '-updatedAt';
  query?: string;
  paginationType?: 'offset' | 'cursor';
  after?: string;
  before?: string;
}

export class ListCategoriesQueryDto {
  parentId?: string;
  pageSize?: number;
  page?: number;
  rootOnly?: boolean;
  query?: string;
  paginationType?: 'offset' | 'cursor';
  after?: string;
  before?: string;
}

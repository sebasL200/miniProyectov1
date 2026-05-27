export class ListProductsQueryDto {
  paginationType?: 'offset' | 'cursor';
  query?: string;
  pageSize?: number;
  page?: number;
  after?: string;
  before?: string;
}

export class ListBrandsQueryDto {
  pageSize?: number;
  page?: number;
  paginationType?: 'offset' | 'cursor';
  after?: string;
  before?: string;
  query?: string;
  name?: string;
  metaTitle?: string;
  isActive?: boolean;
  website?: string;
  slug?: string;
}
export interface ListAttributesQueryDto {
  showDeleted?: boolean;
  pageSize?: number;
  page?: number;
  paginationType?: 'offset' | 'cursor' | 'none';
  after?: string;
  before?: string;
  categoryIds?: string[];
  exclude?: Array<'categoryIds'>;
  appliesToAll?: boolean;
  or?: Array<'categoryIds' | 'appliesToAll'>;
}

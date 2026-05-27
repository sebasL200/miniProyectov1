export class ListVariantsQueryDto {
  paginationType?: 'offset' | 'cursor';
  productId?: string;
  isActive?: boolean;
  pageSize?: number;
  page?: number;
  after?: string;
  before?: string;
}

export class ListVariantsByProductQueryDto extends ListVariantsQueryDto {}

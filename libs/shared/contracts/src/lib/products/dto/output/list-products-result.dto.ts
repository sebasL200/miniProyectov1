import { ProductDto } from './product.dto.js';

export class ListProductsResultDto {
  products!: ProductDto[];
  totalCount?: number;
  totalPages?: number;
  nextCursor?: string;
  prevCursor?: string;
}

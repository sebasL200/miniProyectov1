import { CursorPaginatedResponse, OffsetPaginatedResponse } from '../../../../shared/interfaces/api.interface';
import { Product } from '../../../../shared/models/product.model';

export type ProductsOffsetResponse<TProduct = Product> = OffsetPaginatedResponse<
  'products',
  TProduct
>;
export type ProductsCursorResponse<TProduct = Product> = CursorPaginatedResponse<
  'products',
  TProduct
>;

import { ApiResponse } from '../../../../shared/interfaces/api.interface';
import { Product } from '../../../../shared/models/product.model';

export type GetProductByIdResponse<TProduct = Product> = ApiResponse<{
  product: TProduct;
}>;

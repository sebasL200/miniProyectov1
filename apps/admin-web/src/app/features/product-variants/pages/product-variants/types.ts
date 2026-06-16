import { ApiResponse } from '@shared/interfaces';
import { ProductVariant } from '@shared/models';

export interface ProductVariantsOffsetPagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
}

export interface ProductVariantsPagination {
  offset?: ProductVariantsOffsetPagination;
}

export type ProductVariantsOffsetResponse = ApiResponse<{
  variants: ProductVariant[];
  pagination: ProductVariantsPagination;
}>;

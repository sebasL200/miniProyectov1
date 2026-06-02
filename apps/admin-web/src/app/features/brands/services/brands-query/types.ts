import { CursorPaginatedResponse, OffsetPaginatedResponse } from '../../../../shared/interfaces/api.interface';
import { Brand } from '../../../../shared/models/brand.model';

export type BrandsOffsetResponse = OffsetPaginatedResponse<'brands', Brand>;
export type BrandsCursorResponse = CursorPaginatedResponse<'brands', Brand>;

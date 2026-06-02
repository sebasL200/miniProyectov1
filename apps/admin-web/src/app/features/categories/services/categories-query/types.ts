import { CursorPaginatedResponse, OffsetPaginatedResponse } from '../../../../shared/interfaces/api.interface';
import { Category } from '../../../../shared/models/category.model';

export type CategoriesOffsetResponse = OffsetPaginatedResponse<'categories', Category>;
export type CategoriesCursorResponse = CursorPaginatedResponse<'categories', Category>;

import { ApiResponse, OffsetPaginatedData, OffsetPaginatedResponse } from '../../../../shared/interfaces/api.interface';
import { Category } from '../../../../shared/models/category.model';

type CategoryTable = OffsetPaginatedData<'categories', Category>;

interface CategoryComposite {
    table: CategoryTable;
}

export type CategoriesCompositeResponse = ApiResponse<CategoryComposite>;

export type CategoriesOffsetResponse = OffsetPaginatedResponse<'categories', Category>;

import { ApiResponse, OffsetPaginatedData, OffsetPaginatedResponse } from "@shared/interfaces";
import { Category } from "@shared/models";

type CategoryTable = OffsetPaginatedData<'categories', Category>;

interface CategoryComposite {
    table: CategoryTable;
}

export type CategoriesCompositeResponse = ApiResponse<CategoryComposite>;

export type CategoriesOffsetResponse = OffsetPaginatedResponse<'categories', Category>;

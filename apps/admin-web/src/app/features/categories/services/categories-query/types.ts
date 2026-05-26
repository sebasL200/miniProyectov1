import { CursorPaginatedResponse, OffsetPaginatedResponse } from "@shared/interfaces";
import { Category } from "@shared/models";

export type CategoriesOffsetResponse = OffsetPaginatedResponse<'categories', Category>;
export type CategoriesCursorResponse = CursorPaginatedResponse<'categories', Category>;

import { ApiResponse, BatchResponse } from '../../../../shared/interfaces/api.interface';
import { Category } from '../../../../shared/models/category.model';

export interface SaveCategoryRequest {
    name: string;
    parentId?: string;
    description: string;
    imageUrl?: string;
    metaTitle: string;
    metaDescription: string;
    isActive: boolean;
    visibleInMenu: boolean;
}

export type BulkSaveCategoryItem = SaveCategoryRequest & {
    key: string;
};

export type GetCategoryByIdResponse = ApiResponse<Category>;

export type CategorySavedResponse = ApiResponse<Category>;
export type CategoryBatchSavedResponse = BatchResponse;

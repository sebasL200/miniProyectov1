import { ApiResponse } from '../../../../shared/interfaces/api.interface';
import { Category } from '../../../../shared/models/category.model';

export interface ToggleCategoryVisibilityInMenu {
    id: string;
    visibleInMenu: boolean;
}

export interface ToggleCategoryActiveStatus {
    id: string;
    isActive: boolean;
}


export type UpdateCategory = Partial<Omit<Category, 'id' | 'createdAt' | 'updatedAt'>>;

export type CategoryUpdated = ApiResponse<Category>;
export type CategoryDeleted = ApiResponse<Category>;

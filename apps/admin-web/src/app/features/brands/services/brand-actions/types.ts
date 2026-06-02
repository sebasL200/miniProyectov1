import { ApiResponse } from '../../../../shared/interfaces/api.interface';
import { Brand } from '../../../../shared/models/brand.model';

export interface ToggleBrandVisibilityInMenu {
    id: string;
    visibleInMenu: boolean;
}

export interface ToggleBrandActiveStatus {
    id: string;
    isActive: boolean;
}

export type UpdateBrand = Partial<Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>>;

export type BrandUpdated = ApiResponse<Brand>;

export type BrandDeleted = ApiResponse<Brand>;

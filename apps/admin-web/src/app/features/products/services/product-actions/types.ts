import { ApiResponse } from '../../../../shared/interfaces';
import { Product } from '../../../../shared/models';
import { UpdateProductDto } from '@org/contracts';


export interface ToggleProductActiveStatus {
    id: string;
    isActive: boolean;
}

export interface ToggleProductFeaturedStatus {
    id: string;
    isFeatured: boolean;
}

export type UpdateProduct = UpdateProductDto;
export type ProductUpdated = ApiResponse<{ product: Product }>;
export type ProductDeleted = ApiResponse<{ product: Product }>;

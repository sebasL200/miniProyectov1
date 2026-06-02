import { ApiResponse } from '../../../../shared/interfaces/api.interface';
import { Brand } from '../../../../shared/models/brand.model';

export interface SaveBrandRequest {
    name: string;
    logoUrl: string;
    description: string;
    metaTitle: string;
    website: string;
    metaDescription: string;
    visibleInMenu: boolean;
    isActive: boolean;
}

export type BulkSaveBrandItem = SaveBrandRequest & {
    key: string;
};

export type SaveBrandResponse = ApiResponse<Brand>;

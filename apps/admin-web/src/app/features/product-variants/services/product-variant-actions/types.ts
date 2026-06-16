import { CreateVariantDto } from '@org/contracts';
import { UpdateVariantDto } from '@org/contracts';
import { ApiResponse } from '../../../../shared/interfaces';
import { ProductVariant } from '../../../../shared/models';

export type CreateProductVariant = CreateVariantDto;
export type UpdateProductVariant = UpdateVariantDto;
export type ProductVariantCreated = ApiResponse<{ variant: ProductVariant }>;
export type ProductVariantUpdated = ApiResponse<{ variant: ProductVariant }>;
export type ProductVariantDeleted = ApiResponse<{ variant: ProductVariant }>;

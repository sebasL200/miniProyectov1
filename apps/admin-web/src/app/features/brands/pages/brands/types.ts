import { BrandPersistedRecord } from '../../interfaces/brand-persisted-record.interface';
import { DraftRecord, EntityData } from '../../../../shared/interfaces/entity-record.interface';
import { OffsetPaginatedResponse } from '../../../../shared/interfaces/api.interface';
import { Brand } from '../../../../shared/models/brand.model';

export type BrandsOffsetResponse = OffsetPaginatedResponse<'brands', Brand>;

export type BrandTableDraft = DraftRecord<Pick<Brand, 'name' | 'slug'> & EntityData>;
export type BrandTableRecord = BrandPersistedRecord | BrandTableDraft;

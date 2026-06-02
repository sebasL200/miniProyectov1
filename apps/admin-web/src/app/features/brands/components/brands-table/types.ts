import { EntityData, EntityRecord } from '../../../../shared/interfaces/entity-record.interface';
import { Brand } from '../../../../shared/models/brand.model';

export type BrandRecord<TDraft extends EntityData = EntityData> = EntityRecord<
    TDraft,
    Brand & EntityData
>;

export type BrandStatusChange = { snapshot: BrandRecord; newValue: boolean };
export type BrandVisibleInMenuChange = { snapshot: BrandRecord; newValue: boolean };

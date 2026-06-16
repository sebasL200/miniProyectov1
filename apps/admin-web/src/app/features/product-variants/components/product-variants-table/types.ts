import { EntityData, EntityRecord } from '@shared/interfaces';
import { ProductVariant } from '@shared/models';

export type ProductVariantRecord<TDraft extends EntityData = EntityData> = EntityRecord<
  TDraft,
  ProductVariant & EntityData
>;

export type ProductVariantTableAction = 'edit' | 'view' | 'delete';

export interface ProductVariantTableActionEvent {
  action: ProductVariantTableAction;
  record: ProductVariantRecord;
}

import { EntityData, EntityRecord } from '../../../../shared/interfaces/entity-record.interface';
import { Product } from '../../../../shared/models/product.model';

export type ProductRecord<TDraft extends EntityData = EntityData> = EntityRecord<
    TDraft,
    Product & EntityData
>;

export type ProductStatusChange = {
    snapshot: ProductRecord;
    newValue: boolean;
};

export type ProductFeaturedChange = {
    snapshot: ProductRecord;
    newValue: boolean;
};

export type ProductTableAction = 'delete' | 'edit' | 'view' | 'addOffer';

export type ProductTableActionEvent = {
    action: ProductTableAction;
    record: ProductRecord;
};

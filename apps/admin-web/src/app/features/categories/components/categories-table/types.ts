import { EntityData, EntityRecord } from '../../../../shared/interfaces/entity-record.interface';
import { Category } from '../../../../shared/models/category.model';

export type CategoryRecord<TDraft extends EntityData = EntityData> = EntityRecord<
    TDraft,
    Category & EntityData
>;

export type CategoryStatusChange = { snapshot: CategoryRecord; newValue: boolean };
export type CategoryVisibleInMenuChange = { snapshot: CategoryRecord; newValue: boolean };
type CategoryTableAction = 'view' | 'edit' | 'delete' | 'viewSubcategories';
export type CategoryTableActionEvent = {
    action: CategoryTableAction;
    record: CategoryRecord;
}

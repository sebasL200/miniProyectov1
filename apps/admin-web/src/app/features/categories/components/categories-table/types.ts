import { EntityData, EntityRecord } from "@shared/interfaces";
import { Category } from "@shared/models";

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

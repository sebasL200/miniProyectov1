import { CategoryFormData } from '@categories/components/forms/category-form/types';
import { UpdateCategory } from '@categories/services/category-actions/types';
import { SaveCategoryRequest } from '@categories/services/category/types';
import { ApiResponse, BatchStatus, DraftRecord, EntityData, PersistedRecord } from '@shared/interfaces';
import { Category } from '@shared/models';

export type SubcategoryPersistedRecord = PersistedRecord<Category & EntityData>;
export type SubcategoryDraftRecord = DraftRecord<CategoryFormData & EntityData>;

interface SubcategoriesComposite {
    category: Category;
}

export type SubcategoriesCompositeResponse = ApiResponse<SubcategoriesComposite>;

export type BulkSyncNewCategoryItem = SaveCategoryRequest & {
    key: string;
};

export type BulkSyncUpdateCategoryItem = {
    id: string;
    changes: UpdateCategory;
};

export interface BulkSyncCategoryChildrenRequest {
    newCategories: BulkSyncNewCategoryItem[];
    updateCategories: BulkSyncUpdateCategoryItem[];
    deleteCategories: string[];
}

export interface SyncCreatedItem {
    key: string;
    id: string;
}

export interface SyncUpdatedItem {
    id: string;
}

export interface SyncDeletedItem {
    id: string;
}

export interface SyncFailedItem {
    key?: string;
    id?: string;
    reason: string;
}

export interface SyncBatchOperation<TSucceeded> {
    succeeded: TSucceeded[];
    failed: SyncFailedItem[];
}

export interface SyncCategoryChildrenResult {
    status: BatchStatus;
    created: SyncBatchOperation<SyncCreatedItem>;
    updated: SyncBatchOperation<SyncUpdatedItem>;
    deleted: SyncBatchOperation<SyncDeletedItem>;
}

export type SyncCategoryChildrenResponse = ApiResponse<SyncCategoryChildrenResult>;

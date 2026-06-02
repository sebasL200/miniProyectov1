import { computed, Injectable, signal } from '@angular/core';
import {
    BulkSyncNewCategoryItem,
    BulkSyncUpdateCategoryItem,
    SubcategoryDraftRecord,
    SubcategoryPersistedRecord,
    SyncBatchOperation,
    SyncCreatedItem,
    SyncDeletedItem,
    SyncUpdatedItem,
} from '../types';
import { EntityData } from '../../../../../shared/interfaces/entity-record.interface';
import { draftToPersistedRecord, toDraftRecord } from '../../../../../shared/mappers/entity-record.mapper';
import { CategoryFormData } from '../../../components/forms/category-form/types';
import { CategoryRecord } from '../../../components/categories-table/types';

@Injectable()
export class SubcategoriesStateService {
    private readonly subcategoriesPersisted = signal<SubcategoryPersistedRecord[]>([]);
    private readonly subcategoriesDraft = signal<SubcategoryDraftRecord[]>([]);
    private readonly pendingChanges = signal<BulkSyncUpdateCategoryItem[]>([]);
    private readonly deleteIds = signal<string[]>([]);

    readonly hasPendingChanges = computed(
        () =>
            this.subcategoriesDraft().length > 0 ||
            this.pendingChanges().length > 0 ||
            this.deleteIds().length > 0,
    );

    readonly rows = computed(() => {
        const persisted = this.subcategoriesPersisted().map((record) => structuredClone(record));
        const draft = this.subcategoriesDraft();
        return [...draft, ...persisted].filter(
            (record) => !this.deleteIds().includes(record.data.id),
        );
    });

    setPersisted(records: SubcategoryPersistedRecord[]): void {
        this.subcategoriesPersisted.set(records);
    }

    addDraft(categoryData: CategoryFormData): void {
        const newDraft: SubcategoryDraftRecord = toDraftRecord(categoryData);
        this.subcategoriesDraft.update((drafts) => [newDraft, ...drafts]);
    }

    markCategoryForDeletion(recordKey: string): void {
        const draft = this.subcategoriesDraft().find((d) => d.data._recordKey === recordKey);
        if (draft) {
            this.subcategoriesDraft.update((drafts) =>
                drafts.filter((d) => d.data._recordKey !== recordKey),
            );
        } else {
            const persistedRecord = this.findPersistedCategoryByRecordKey(recordKey);
            if (!persistedRecord) return;
            this.deleteIds.update((ids) => [...ids, persistedRecord.data.id]);
        }
    }

    syncPendingChangeForField(
        field: keyof BulkSyncUpdateCategoryItem['changes'],
        newValue: boolean,
        snapshot: CategoryRecord<EntityData>,
    ): void {
        const persistedCategory = this.findPersistedCategoryByRecordKey(snapshot.data._recordKey);
        if (!persistedCategory) return;

        const isFieldAlreadyPending = this.hasPendingChangeForField(
            persistedCategory.data.id,
            field,
        );
        const originalValue = persistedCategory.data[field];

        if (!isFieldAlreadyPending && originalValue !== newValue) {
            this.addPendingChange(persistedCategory.data.id, field, newValue);
        } else if (isFieldAlreadyPending && originalValue === newValue) {
            this.removePendingChangeField(persistedCategory.data.id, field);
        }
    }

    applyCreatedItems(created: SyncBatchOperation<SyncCreatedItem>): void {
        const createdKeys = new Set(created.succeeded.map((item) => item.key));

        const newPersisted = this.subcategoriesDraft()
            .filter((draft) => createdKeys.has(draft.data._recordKey))
            .map((draft) => {
                const createdItem = created.succeeded.find(
                    (item) => item.key === draft.data._recordKey,
                )!;
                return this.toSubcategoryPersisted(draft, createdItem.id);
            });

        this.subcategoriesPersisted.update((persisted) => [...persisted, ...newPersisted]);
        this.subcategoriesDraft.update((drafts) =>
            drafts.filter((draft) => !createdKeys.has(draft.data._recordKey)),
        );
    }

    applyUpdatedItems(updated: SyncBatchOperation<SyncUpdatedItem>): void {
        const updatedIds = new Set(updated.succeeded.map((item) => item.id));
        const succeededChanges = this.pendingChanges().filter((change) =>
            updatedIds.has(change.id),
        );

        this.subcategoriesPersisted.update((persisted) =>
            persisted.map((record) => {
                const pendingChange = succeededChanges.find(
                    (change) => change.id === record.data.id,
                );
                if (!pendingChange) return record;
                return { ...record, data: { ...record.data, ...pendingChange.changes } };
            }),
        );

        this.pendingChanges.update((changes) =>
            changes.filter((change) => !updatedIds.has(change.id)),
        );
    }

    applyDeletedItems(deleted: SyncBatchOperation<SyncDeletedItem>): void {
        const deletedIds = new Set(deleted.succeeded.map((item) => item.id));
        this.subcategoriesPersisted.update((persisted) =>
            persisted.filter((record) => !deletedIds.has(record.data.id)),
        );
        this.deleteIds.update((ids) => ids.filter((id) => !deletedIds.has(id)));
    }

    getBulkSaveItems(): BulkSyncNewCategoryItem[] {
        return this.subcategoriesDraft().map((record) => this.toBulkSaveCategoryItem(record));
    }

    getPendingChanges(): BulkSyncUpdateCategoryItem[] {
        return this.pendingChanges();
    }

    getDeleteIds(): string[] {
        return this.deleteIds();
    }

    getCategoryNameById(id: string): string | undefined {
        return this.subcategoriesPersisted().find((record) => record.data.id === id)?.data.name;
    }

    private findPersistedCategoryByRecordKey(
        recordKey: string,
    ): SubcategoryPersistedRecord | undefined {
        return this.subcategoriesPersisted().find((record) => record.data._recordKey === recordKey);
    }

    private hasPendingChangeForField(
        id: string,
        field: keyof BulkSyncUpdateCategoryItem['changes'],
    ): boolean {
        return this.pendingChanges().some((change) => change.id === id && field in change.changes);
    }
    private addPendingChange(
        id: string,
        field: keyof BulkSyncUpdateCategoryItem['changes'],
        newValue: boolean,
    ): void {
        const existingIndex = this.pendingChanges().findIndex((change) => change.id === id);
        if (existingIndex !== -1) {
            this.pendingChanges.update((changes) =>
                changes.map((change, index) =>
                    index === existingIndex
                        ? { ...change, changes: { ...change.changes, [field]: newValue } }
                        : change,
                ),
            );
        } else {
            this.pendingChanges.update((changes) => [
                ...changes,
                { id, changes: { [field]: newValue } },
            ]);
        }
    }

    private removePendingChangeField(
        id: string,
        field: keyof BulkSyncUpdateCategoryItem['changes'],
    ): void {
        this.pendingChanges.update((changes) =>
            changes.reduce<BulkSyncUpdateCategoryItem[]>((acc, change) => {
                if (change.id !== id) return [...acc, change];

                const { [field]: _, ...remainingChanges } = change.changes;

                if (Object.keys(remainingChanges).length === 0) return acc;

                return [...acc, { ...change, changes: remainingChanges }];
            }, []),
        );
    }

    private toBulkSaveCategoryItem(record: SubcategoryDraftRecord): BulkSyncNewCategoryItem {
        return {
            key: record.data._recordKey,
            name: record.data.name,
            description: record.data.description,
            imageUrl: this.toCategoryImageUrl(record.data.imageUrl),
            isActive: record.data.isActive,
            visibleInMenu: record.data.visibleInMenu,
            metaDescription: record.data.metaDescription,
            metaTitle: record.data.metaTitle,
        };
    }

    private toSubcategoryPersisted(
        draft: SubcategoryDraftRecord,
        id: string,
    ): SubcategoryPersistedRecord {
        return draftToPersistedRecord(draft, id, (data, id) => ({
            id,
            name: data.name,
            description: data.description,
            imageUrl: this.toCategoryImageUrl(data.imageUrl),
            isActive: data.isActive,
            visibleInMenu: data.visibleInMenu,
            metaDescription: data.metaDescription,
            metaTitle: data.metaTitle,
            slug: '',
            parentId: null,
            parentName: null,
            children: [],
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
    }

    private toCategoryImageUrl(value: string[]): string | undefined {
        return value[0] || undefined;
    }
}

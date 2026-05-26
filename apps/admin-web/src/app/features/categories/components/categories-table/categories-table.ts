import { Component, computed, inject, input } from '@angular/core';
import { CategoriesTableService } from './categories-table.service';
import { DataGridColumn } from '@shared/components/ui/data-grid/data-grid.types';
import { CATEGORIES_BASE_COLUMNS } from './consts';
import { EntityData, PaginationOptions } from '@shared/interfaces';
import { CategoryRecord } from './types';
import { DataGrid } from '@shared/components/ui/data-grid/data-grid';
import { Switch, Card, PaginationFooter } from '@shared/components';
import { CategoryTableActions } from '../category-table-actions/category-table-actions';
import { CategoriesActionsOptions } from '../category-table-actions/types';
import { CellTemplate } from '@shared/components/ui/data-grid/directives/cell-template';

@Component({
    selector: 'ecom-categories-table',
    imports: [DataGrid, Switch, CategoryTableActions, Card, PaginationFooter, CellTemplate],
    templateUrl: './categories-table.html',
    styleUrl: './categories-table.css',
})
export class CategoriesTable {
    private readonly service: CategoriesTableService = inject(CategoriesTableService);

    columns = input<DataGridColumn[]>(CATEGORIES_BASE_COLUMNS);
    data = input<CategoryRecord[]>([]);
    rows = computed(() => this.data().map((record) => record.data));
    pagination = input.required<PaginationOptions>();

    private readonly snapshot = computed(() =>
        this.data().map((record) => structuredClone(record)),
    );

    actions = input<CategoriesActionsOptions>({
        canDelete: true,
        canEdit: true,
        canView: true,
        canViewSubcategories: true,
    });

    toggleVisibleInMenu(data: EntityData, newValue: boolean): void {
        const snapshot = this.snapshot().find((r) => r.data._recordKey === data._recordKey);
        if (!snapshot) {
            this.service.categoryVisibleInMenuChange$.error(
                new Error(
                    `No se encontró el registro para la categoría con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (snapshot) {
            this.service.categoryVisibleInMenuChange$.next({
                snapshot: snapshot,
                newValue,
            });
        }
    }

    toggleStatus(data: EntityData, newValue: boolean): void {
        const snapshotRecord = this.snapshot().find((r) => r.data._recordKey === data._recordKey);
        if (!snapshotRecord) {
            this.service.categoryStatusChange$.error(
                new Error(
                    `No se encontró el registro para la categoría con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (snapshotRecord) {
            this.service.categoryStatusChange$.next({
                snapshot: snapshotRecord,
                newValue,
            });
        }
    }

    onPageChange(page: number) {
        this.service.pageChange$.next(page);
    }

    onEdit(data: EntityData) {
        const record = this.data().find((r) => r.data._recordKey === data._recordKey);
        if (!record) {
            this.service.actionCategory$.error(
                new Error(
                    `No se encontró el registro para la categoría con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (record) {
            this.service.actionCategory$.next({ action: 'edit', record });
        }
    }

    onDelete(data: EntityData) {
        const record = this.data().find((r) => r.data._recordKey === data._recordKey);
        if (!record) {
            this.service.actionCategory$.error(
                new Error(
                    `No se encontró el registro para la categoría con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (record) {
            this.service.actionCategory$.next({ action: 'delete', record });
        }
    }

    onView(data: EntityData) {
        const record = this.data().find((r) => r.data._recordKey === data._recordKey);
        if (!record) {
            this.service.actionCategory$.error(
                new Error(
                    `No se encontró el registro para la categoría con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (record) {
            this.service.actionCategory$.next({ action: 'view', record });
        }
    }

    onViewSubcategories(data: EntityData) {
        const record = this.data().find((r) => r.data._recordKey === data._recordKey);
        if (!record) {
            this.service.actionCategory$.error(
                new Error(
                    `No se encontró el registro para la categoría con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (record) {
            this.service.actionCategory$.next({ action: 'viewSubcategories', record });
        }
    }
}

import { Component, computed, inject, input } from '@angular/core';
import { Card } from '../../../../shared/components/ui/card/card';
import { Image } from '../../../../shared/components/ui/image/image';
import { Button } from '../../../../shared/components/ui/button/button';
import { Switch } from '../../../../shared/components/ui/switch/switch';
import { PaginationFooter } from '../../../../shared/components/pagination-footer/pagination-footer';
import { DataGridColumn } from '../../../../shared/components/ui/data-grid/data-grid.types';
import { BRANDS_TABLE_BASE_COLUMNS } from './consts';
import { DataGrid } from '../../../../shared/components/ui/data-grid/data-grid';
import { CellTemplate } from '../../../../shared/components/ui/data-grid/directives/cell-template';
import { Slot } from '../../../../shared/directives/slot/slot';
import { BrandRecord } from './types';
import { EntityData } from '../../../../shared/interfaces/entity-record.interface';
import { BrandsTableService } from './brands-table.service';
import { PaginationOptions } from '../../../../shared/interfaces/pagination-options.interface';
import { BrandTableActions } from '../brand-table-actions/brand-table-actions';
import { BrandTableActionsOptions } from '../brand-table-actions/types';
import { TruncateText } from '../../../../shared/components/truncate-text/truncate-text';

@Component({
    selector: 'ecom-brands-table',
    imports: [
    Card,
    DataGrid,
    CellTemplate,
    Image,
    Slot,
    Button,
    Switch,
    PaginationFooter,
    BrandTableActions,
    TruncateText
],
    templateUrl: './brands-table.html',
    styleUrl: './brands-table.css',
})
export class BrandsTable {
    private readonly service = inject(BrandsTableService);

    columns = input<DataGridColumn[]>(BRANDS_TABLE_BASE_COLUMNS);
    data = input<BrandRecord[]>([]);
    actions = input<BrandTableActionsOptions>({
        canDelete: true,
        canEdit: true,
        canView: true,
    });

    pagination = input.required<PaginationOptions>();

    rows = computed(() => this.data().map((record) => record.data));
    private readonly snapshot = computed(() =>
        this.data().map((record) => structuredClone(record)),
    );

    logoUrl(row: { logoUrl?: string | string[] }): string {
        return Array.isArray(row.logoUrl) ? (row.logoUrl[0] ?? '') : (row.logoUrl ?? '');
    }

    toggleVisibleInMenu(data: EntityData, newValue: boolean): void {
        const record = this.data().find((r) => r.data._recordKey === data._recordKey);
        if (!record) {
            this.service.brandStatusChange$.error(
                new Error(
                    `No se encontró el registro para la marca con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (record) {
            this.service.brandVisibleInMenuChange$.next({
                snapshot: record,
                newValue,
            });
        }
    }

    onPageChange(newPage: number): void {
        this.service.pageChange$.next(newPage);
    }

    toggleBrandStatus(data: EntityData, newValue: boolean): void {
        const snapshotRecord = this.snapshot().find((r) => r.data._recordKey === data._recordKey);
        if (!snapshotRecord) {
            this.service.brandStatusChange$.error(
                new Error(
                    `No se encontró el registro para la marca con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (snapshotRecord) {
            this.service.brandStatusChange$.next({
                snapshot: snapshotRecord,
                newValue,
            });
        }
    }

    onEditBrand(data: EntityData): void {
        const record = this.data().find((r) => r.data._recordKey === data._recordKey);
        if (!record) {
            this.service.editBrand$.error(
                new Error(
                    `No se encontró el registro para la marca con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (record) {
            this.service.editBrand$.next(record);
        }
    }

    onViewBrand(data: EntityData): void {
        const record = this.data().find((r) => r.data._recordKey === data._recordKey);
        if (!record) {
            this.service.viewBrand$.error(
                new Error(
                    `No se encontró el registro para la marca con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (record) {
            this.service.viewBrand$.next(record);
        }
    }

    onDeleteBrand(data: EntityData): void {
        const record = this.data().find((r) => r.data._recordKey === data._recordKey);
        if (!record) {
            this.service.deleteBrand$.error(
                new Error(
                    `No se encontró el registro para la marca con _recordKey: ${data._recordKey}`,
                ),
            );
        }
        if (record) {
            this.service.deleteBrand$.next(record);
        }
    }
}

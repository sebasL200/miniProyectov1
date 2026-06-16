import { Component, computed, inject, input } from '@angular/core';
import { Image } from '@shared/components';
import { Card, PaginationFooter } from '@shared/components';
import { DataGrid } from '@shared/components/ui/data-grid/data-grid';
import { CellTemplate } from '@shared/components/ui/data-grid/directives/cell-template';
import { DataGridColumn } from '@shared/components/ui/data-grid/data-grid.types';
import { EntityData, PaginationOptions } from '@shared/interfaces';
import { CurrencyPipe } from '@shared/pipes/currency/currency-pipe';
import { PRODUCT_VARIANTS_BASE_COLUMNS } from '../../consts/product-variants-columns.consts';
import { ProductVariantTableActions } from '../product-variant-table-actions/product-variant-table-actions';
import { ProductVariantTableActionsOptions } from '../product-variant-table-actions/types';
import { ProductVariantRecord } from './types';
import { ProductVariantsTableService } from './product-variants-table.service';

@Component({
  selector: 'ecom-product-variants-table',
  imports: [
    Card,
    DataGrid,
    CellTemplate,
    Image,
    ProductVariantTableActions,
    PaginationFooter,
    CurrencyPipe,
  ],
  templateUrl: './product-variants-table.html',
  styleUrl: './product-variants-table.css',
})
export class ProductVariantsTable {
  private readonly service = inject(ProductVariantsTableService);

  readonly columns = input<DataGridColumn[]>(PRODUCT_VARIANTS_BASE_COLUMNS);
  readonly data = input<ProductVariantRecord[]>([]);
  readonly rows = computed(() => this.data().map((record) => record.data));
  readonly pagination = input.required<PaginationOptions>();
  readonly actionsOptions = input<ProductVariantTableActionsOptions>({
    canEdit: true,
    canView: true,
    canDelete: true,
  });

  onPageChange(page: number): void {
    this.service.pageChange$.next(page);
  }

  imageUrl(row: EntityData & { imageUrls?: string[] }): string {
    return row.imageUrls?.[0] ?? '';
  }

  price(row: EntityData & { price?: number }): number {
    return row.price ?? 0;
  }

  weight(row: EntityData & { dimensions?: { weight?: string } }): string {
    const weight = row.dimensions?.weight;

    if (weight === undefined || weight === null || weight === '') {
      return 'Sin peso';
    }

    return weight;
  }

  onEdit(row: EntityData): void {
    this.emitAction('edit', row);
  }

  onView(row: EntityData): void {
    this.emitAction('view', row);
  }

  onDelete(row: EntityData): void {
    this.emitAction('delete', row);
  }

  private emitAction(
    action: 'edit' | 'view' | 'delete',
    row: EntityData,
  ): void {
    const record = this.data().find(
      (item) => item.data._recordKey === row._recordKey,
    );

    if (record) {
      this.service.actionProductVariant$.next({ action, record });
    }
  }
}

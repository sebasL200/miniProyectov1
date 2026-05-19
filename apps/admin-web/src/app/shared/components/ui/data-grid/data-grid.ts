import { Component, computed, contentChildren, input, TemplateRef } from '@angular/core';
import { DataGridColumn } from './data-grid.types';
import { DataGridCell } from './components/data-grid-cell/data-grid-cell';
import { CellTemplate } from './directives/cell-template';
import { NgTemplateOutlet, SlicePipe } from '@angular/common';

@Component({
  selector: 'ecom-data-grid',
  imports: [DataGridCell, NgTemplateOutlet, SlicePipe],
  templateUrl: './data-grid.html',
  styleUrl: './data-grid.css',
})
export class DataGrid {
  columns = input.required<DataGridColumn[]>();
  data = input<any[]>([]);
  isLoading = input(false, { alias: 'loading' });
  rowsLimit = input<number | undefined>();

  rowsLeft = computed(() => {
    if (this.rowsLimit() !== undefined) {
      const remaining = this.rowsLimit()! - this.data().length;
      return remaining > 0 ? Array(remaining).fill(null) : [];
    }
    return [];
  });

  templates = contentChildren(CellTemplate);

  getTemplate(template: string | undefined): TemplateRef<any> | null {
    if (!template) {
      return null;
    }
    const cellTemplate = this.templates().find((t) => t.cellTemplate() === template);
    return cellTemplate ? cellTemplate.template : null;
  }
}

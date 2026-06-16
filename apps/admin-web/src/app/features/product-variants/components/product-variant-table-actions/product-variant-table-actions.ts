import { Component, input, output } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEye, faPenNib, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@shared/components';
import { ProductVariantTableActionsOptions } from './types';

@Component({
  selector: 'ecom-product-variant-table-actions',
  imports: [Button, FaIconComponent],
  templateUrl: './product-variant-table-actions.html',
  styleUrl: './product-variant-table-actions.css',
  host: {
    class: 'flex items-center gap-2 justify-center',
  },
})
export class ProductVariantTableActions {
  readonly options = input.required<ProductVariantTableActionsOptions>();
  readonly edit = output<void>();
  readonly view = output<void>();
  readonly delete = output<void>();

  readonly faPenNib = faPenNib;
  readonly faEye = faEye;
  readonly faTrashCan = faTrashCan;

  onEdit(): void {
    this.edit.emit();
  }

  onView(): void {
    this.view.emit();
  }

  onDelete(): void {
    this.delete.emit();
  }
}

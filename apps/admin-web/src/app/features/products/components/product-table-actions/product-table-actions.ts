import { Component, input, output } from '@angular/core';
import { ProductTableActionsOptions } from './types';
import { Button } from '../../../../shared/components/ui/button/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEye, faPenNib, faSquarePlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'ecom-product-table-actions',
    imports: [Button, FaIconComponent],
    templateUrl: './product-table-actions.html',
    host: {
        class: 'flex items-center gap-2 justify-center',
    }
})
export class ProductTableActions {
    options = input.required<ProductTableActionsOptions>();
    addOffer = output<void>();
    edit = output<void>();
    delete = output<void>();
    view = output<void>();

    faPenNib = faPenNib;
    faTrashCan = faTrashCan;
    faEye = faEye;
    faSquarePlus = faSquarePlus;

    onAddOffer() {
        this.addOffer.emit();
    }

    onEdit() {
        this.edit.emit();
    }

    onDelete() {
        this.delete.emit();
    }

    onView() {
        this.view.emit();
    }
}

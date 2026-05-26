import { Component, input, output } from '@angular/core';
import { CategoriesActionsOptions } from './types';
import { faEye, faPenNib, faSquarePlus, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@shared/components';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'ecom-category-table-actions',
    imports: [Button, FaIconComponent],
    templateUrl: './category-table-actions.html',
    styleUrl: './category-table-actions.css',
    host: {
        class: 'flex gap-2 justify-center',
    },
})
export class CategoryTableActions {
    options = input.required<CategoriesActionsOptions>();
    edit = output<void>();
    delete = output<void>();
    view = output<void>();
    subcategories = output<void>();

    faPenNib = faPenNib;
    faTrashCan = faTrashCan;
    faEye = faEye;
    faSquarePlus = faSquarePlus;

    onEdit() {
        this.edit.emit();
    }

    onDelete() {
        this.delete.emit();
    }

    onView() {
        this.view.emit();
    }

    onSubcategories() {
        this.subcategories.emit();
    }
}

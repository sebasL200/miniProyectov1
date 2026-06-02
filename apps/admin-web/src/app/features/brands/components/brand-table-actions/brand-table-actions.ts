import { Component, input, output } from '@angular/core';
import { faEye, faPenNib, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import { BrandTableActionsOptions } from './types';
import { Button } from '../../../../shared/components/ui/button/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'ecom-brand-table-actions',
    imports: [Button, FaIconComponent],
    templateUrl: './brand-table-actions.html',
    styleUrl: './brand-table-actions.css',
    host: {
        class: 'flex gap-2 justify-center',
    },
})
export class BrandTableActions {
    faPenNib = faPenNib;
    faTrashCan = faTrashCan;
    faEye = faEye;

    readonly delete = output<void>();
    readonly view = output<void>();
    readonly edit = output<void>();

    options = input.required<BrandTableActionsOptions>();

    onDelete(): void {
        this.delete.emit();
    }

    onView(): void {
        this.view.emit();
    }

    onEdit(): void {
        this.edit.emit();
    }
}

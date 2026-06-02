import { Component, inject, signal } from '@angular/core';
import { IDialogComponent } from '../../../../../shared/components/ui/dialog/interfaces/dialog-component.interface';
import { DialogRef } from '../../../../../shared/components/ui/dialog/models/dialog-ref.model';
import { Category } from '../../../../../shared/models/category.model';
import { CategoryForm } from '../../forms/category-form/category-form';
import { CategoryFormData } from '../../forms/category-form/types';
import { CategoryService } from '../../../services/category/category.service';
import { SaveCategoryRequest } from '../../../services/category/types';
import { FormActionsOptions, FormEvent } from '../../../../../shared/interfaces/form.interface';

@Component({
    selector: 'ecom-register-category.dialog',
    imports: [CategoryForm],
    templateUrl: './register-category.dialog.html',
    styleUrl: './register-category.dialog.css',
    providers: [CategoryService],
})
export class RegisterCategoryDialog implements IDialogComponent<void, Category> {
    private readonly categoryService = inject(CategoryService);

    protected readonly categoryFormActions = signal<FormActionsOptions>(
        new FormActionsOptions({
            submitButtonVariant: 'secondary',
        }),
    );

    private readonly dialogRef = signal<DialogRef<void, Category> | null>(null);

    onSubmit(event: FormEvent<CategoryFormData>): void {
        if (!event.data) {
            return;
        }

        const request = this.toSaveCategoryRequest(event.data);
        this.categoryService.saveCategory(request).subscribe({
            next: ({ data }) => {
                void this.dialogRef()?.close(data);
            },
        });
    }

    setDialogRef(ref: DialogRef<void, Category>): void {
        this.dialogRef.set(ref);
    }

    private toSaveCategoryRequest(formData: CategoryFormData): SaveCategoryRequest {
        return {
            name: formData.name,
            description: formData.description,
            imageUrl: this.toCategoryImageUrl(formData.imageUrl),
            metaTitle: formData.metaTitle,
            metaDescription: formData.metaDescription,
            isActive: formData.isActive,
            visibleInMenu: formData.visibleInMenu,
        };
    }

    private toCategoryImageUrl(value: string[]): string | undefined {
        return value[0] || undefined;
    }
}

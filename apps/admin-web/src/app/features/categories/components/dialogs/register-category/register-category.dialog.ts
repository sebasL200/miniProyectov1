import { Component, computed, effect, inject, signal } from '@angular/core';
import { IDialogComponent } from '@shared/components/ui/dialog/interfaces/dialog-component.interface';
import { DialogRef } from '@shared/components/ui/dialog/models/dialog-ref.model';
import { Category } from '@shared/models';
import { CategoryForm } from "@categories/components/forms/category-form/category-form";
import { CategoryFormData } from '@categories/components/forms/category-form/types';
import { CategoryService } from '@categories/services/category/category.service';
import { CategoryActionsService } from '@categories/services/category-actions/category-actions.service';
import { SaveCategoryRequest } from '@categories/services/category/types';
import { UpdateCategory } from '@categories/services/category-actions/types';
import { FormActionsOptions, FormEvent } from '@shared/interfaces';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
    selector: 'ecom-register-category.dialog',
    imports: [CategoryForm],
    templateUrl: './register-category.dialog.html',
    styleUrl: './register-category.dialog.css',
    providers: [CategoryService, CategoryActionsService],
})
export class RegisterCategoryDialog implements IDialogComponent<string | undefined, Category> {
    private readonly categoryService = inject(CategoryService);
    private readonly categoryActionsService = inject(CategoryActionsService);
    private readonly toastService = inject(ToastService);

    private readonly dialogRef = signal<DialogRef<string | undefined, Category> | null>(null);
    private readonly categoryId = signal<string | null>(null);
    private readonly category = signal<Category | null>(null);

    readonly isEditMode = computed(() => this.categoryId() !== null);
    readonly isLoading = signal(false);

    readonly categoryFormData = computed<CategoryFormData | null>(() => {
        if (!this.isEditMode()) return null;
        const cat = this.category();
        if (!cat) return null;
        return this.toCategoryFormData(cat);
    });

    protected readonly categoryFormActions = computed(() =>
        new FormActionsOptions({
            submitButtonVariant: 'secondary',
            submitLabel: this.isEditMode() ? 'Actualizar' : 'Guardar',
        }),
    );

    constructor() {
        effect(() => {
            const id = this.categoryId();
            if (id) {
                this.loadCategory(id);
            }
        });
    }

    setDialogRef(ref: DialogRef<string | undefined, Category>): void {
        this.dialogRef.set(ref);
        if (ref.data) {
            this.categoryId.set(ref.data);
        }
    }

    onSubmit(event: FormEvent<CategoryFormData>): void {
        if (!event.data) {
            return;
        }

        if (this.isEditMode()) {
            this.updateCategory(event);
        } else {
            this.createCategory(event);
        }
    }

    private createCategory(event: FormEvent<CategoryFormData>): void {
        const request = this.toSaveCategoryRequest(event.data!);
        this.categoryService.saveCategory(request).subscribe({
            next: ({ data }) => {
                void this.dialogRef()?.close(data);
            },
        });
    }

    private updateCategory(event: FormEvent<CategoryFormData>): void {
        const payload = this.toUpdateCategoryPayload(event.changes!);
        this.categoryActionsService.updateCategory(this.categoryId()!, payload).subscribe({
            next: ({ data }) => {
                this.toastService.showSuccess('Categoría actualizada exitosamente');
                void this.dialogRef()?.close(data);
            },
            error: () => {
                this.toastService.showError('Error al actualizar la categoría');
            },
        });
    }

    private loadCategory(id: string): void {
        this.isLoading.set(true);
        this.categoryService.getCategoryById(id).subscribe({
            next: ({ data }) => {
                this.category.set(data);
                this.isLoading.set(false);
            },
            error: () => {
                this.toastService.showError('Error al cargar la categoría');
                this.isLoading.set(false);
                void this.dialogRef()?.close();
            },
        });
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

    private toUpdateCategoryPayload(formData: Partial<CategoryFormData>): UpdateCategory {
        return {
            ...(formData.name !== undefined && { name: formData.name }),
            ...(formData.description !== undefined && { description: formData.description }),
            ...(formData.imageUrl !== undefined && {
                imageUrl: this.toCategoryImageUrl(formData.imageUrl),
            }),
            ...(formData.isActive !== undefined && { isActive: formData.isActive }),
            ...(formData.metaDescription !== undefined && {
                metaDescription: formData.metaDescription,
            }),
            ...(formData.metaTitle !== undefined && { metaTitle: formData.metaTitle }),
            ...(formData.visibleInMenu !== undefined && { visibleInMenu: formData.visibleInMenu }),
        };
    }

    private toCategoryFormData(category: Category): CategoryFormData {
        return {
            name: category.name,
            description: category.description,
            imageUrl: this.toCategoryImageUploadValue(category.imageUrl),
            isActive: category.isActive,
            metaDescription: category.metaDescription,
            metaTitle: category.metaTitle,
            visibleInMenu: category.visibleInMenu,
        };
    }

    private toCategoryImageUrl(value: string[]): string | undefined {
        return value[0] || undefined;
    }

    private toCategoryImageUploadValue(value?: string | null): string[] {
        return value ? [value] : [];
    }
}

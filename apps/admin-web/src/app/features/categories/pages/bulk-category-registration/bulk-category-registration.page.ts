import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { PageLayout, PageHeader, Card, Button } from '@shared/components';
import { CategoryForm } from '@categories/components/forms/category-form/category-form';
import { CategoriesTable } from '@categories/components/categories-table/categories-table';
import { createPagination, FormActionsOptions, FormEvent } from '@shared/interfaces';
import { CategoryDraft } from './types';
import { CategoryFormData } from '@categories/components/forms/category-form/types';
import { toDraftRecord } from '@shared/mappers/entity-record.mapper';
import { BULK_CATEGORY_REGISTRATION_COLUMNS } from './consts';
import { CategoriesActionsOptions } from '@categories/components/category-table-actions/types';
import { CategoriesTableService } from '@categories/components/categories-table/categories-table.service';
import { CategoryRecord } from '@categories/components/categories-table/types';
import { CategoryService } from '@categories/services/category/category.service';
import { BulkSaveCategoryItem } from '@categories/services/category/types';
import { ToastService } from '@shared/services/toast/toast.service';
import { DialogService } from '@shared/services/dialog/dialog.service';
import { Location } from '@angular/common';

@Component({
    selector: 'ecom-bulk-category-registration.page',
    imports: [PageLayout, PageHeader, CategoryForm, Card, CategoriesTable, Button],
    templateUrl: './bulk-category-registration.page.html',
    styleUrl: './bulk-category-registration.page.css',
    providers: [CategoriesTableService, CategoryService],
})
export class BulkCategoryRegistrationPage implements OnInit {
    private readonly categoriesTableService: CategoriesTableService =
        inject(CategoriesTableService);
    private readonly toastService: ToastService = inject(ToastService);
    private readonly categoryService: CategoryService = inject(CategoryService);
    private readonly dialogService = inject(DialogService);
    private readonly location: Location = inject(Location);

    categories = signal<CategoryDraft[]>([]);

    readonly canSave = computed(() => this.categories().length > 0);
    readonly columns = BULK_CATEGORY_REGISTRATION_COLUMNS;

    readonly pagination = createPagination({
        showPagination: false,
    });

    readonly categoryTableActions: CategoriesActionsOptions = {
        canDelete: true,
        canEdit: false,
        canView: false,
        canViewSubcategories: false,
    };

    readonly formActions = new FormActionsOptions({
        canCancel: false,
        canClear: true,
        clearOnSubmit: true,
        submitButtonVariant: 'secondary',
        submitLabel: 'Agregar Registro',
        clearButtonVariant: 'ghost',
    });

    ngOnInit(): void {
        this.registerTableHandlers();
    }

    private registerTableHandlers() {
        this.registerActionCategoryHanlder();
    }

    private registerActionCategoryHanlder() {
        this.categoriesTableService.actionCategory$.subscribe(({ action, record }) => {
            switch (action) {
                case 'delete':
                    this.onDeleteCategory(record);
                    break;
            }
        });
    }

    private onDeleteCategory(record: CategoryRecord) {
        this.categories.update((categories) =>
            categories.filter((c) => c.data._recordKey !== record.data._recordKey),
        );
    }

    onSubmit(event: FormEvent<CategoryFormData>) {
        const draft = toDraftRecord<CategoryFormData>(event.data!);
        this.categories.update((categories) => [...categories, draft]);
    }

    onSave() {
        const categoriesToSave: BulkSaveCategoryItem[] = this.categories().map((c) =>
            this.toCategoryItem(c),
        );
        this.categoryService
            .saveBatchCategories(categoriesToSave)
            .subscribe(({ success, data: { succeeded, failed } }) => {
                if (success) {
                    const savedCount = succeeded.length;
                    if (savedCount > 0) {
                        this.toastService.showSuccess(
                            `${savedCount} categorías registradas exitosamente.`,
                        );
                    }
                    const failedCount = failed.length;
                    if (failedCount > 0) {
                        this.toastService.showError(
                            `${failedCount} categorías no pudieron ser registradas.`,
                        );
                    }
                    this.categories.update((categories) =>
                        categories.filter(
                            (c) => !succeeded.some((s) => s.key === c.data._recordKey),
                        ),
                    );
                } else {
                    this.toastService.showError(
                        'Ocurrió un error al registrar las categorías. Por favor, intenta nuevamente.',
                    );
                }
            });
    }

    private toCategoryItem({ data }: CategoryDraft): BulkSaveCategoryItem {
        return {
            key: data._recordKey,
            description: data.description,
            imageUrl: this.toCategoryImageUrl(data.imageUrl),
            isActive: data.isActive,
            metaDescription: data.metaDescription,
            metaTitle: data.metaTitle,
            name: data.name,
            visibleInMenu: data.visibleInMenu,
        };
    }

    private toCategoryImageUrl(value: string[]): string | undefined {
        return value[0] || undefined;
    }

    onCancel(): void {
        if (this.categories().length === 0) {
            return this.goBack();
        }
        this.dialogService.openConfirm(
            {
                message: '¿Estás seguro que deseas cancelar? Se perderán los cambios no guardados.',
                confirmText: 'Sí, cancelar',
                confirmVariant: 'danger',
                cancelText: 'No, continuar editando',
            },
            {
                title: 'Confirmar cancelación',
            },
        ).onClose$.subscribe((confirmed) => {
            if (confirmed) {
                this.goBack();
            }
        });
    }

    private goBack() {
        this.location.back();
    }
}

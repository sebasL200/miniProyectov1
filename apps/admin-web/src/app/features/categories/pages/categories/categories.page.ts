import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
import { CategoriesService } from './categories.service';
import { createPagination, EntityData, PersistedRecord } from '../../../../shared/interfaces';
import { PageLayout, PageHeader } from '../../../../shared/components';
import { CategoryOverviewActions } from '../../components/category-overview-actions/category-overview-actions';
import { RegisterCategoryStrategy } from '../../components/category-overview-actions/types';
import { CategoriesTable } from '../../components/categories-table/categories-table';
import { Category } from '../../../../shared/models';
import { toPersistedRecord } from '../../../../shared/mappers/entity-record.mapper';
import { CategoriesTableService } from '../../components/categories-table/categories-table.service';
import {
    CategoryStatusChange,
    CategoryTableActionEvent,
    CategoryVisibleInMenuChange,
} from '../../components/categories-table/types';
import { CategoryActionsService } from '../../services/category-actions/category-actions.service';
import { ToastService } from '../../../../shared/services/toast/toast.service';
import { DialogService } from '../../../../shared/services/dialog/dialog.service';
import { RegisterCategoryDialog } from '../../components/dialogs/register-category/register-category.dialog';
import { DIMENSIONS } from '../../../../shared/constants/dimensions.consts';
import { Router } from '@angular/router';
import { CategoryDetailsDialog } from '../../components/dialogs/category-details/category-details.dialog';

@Component({
    selector: 'app-categories-page',
    imports: [PageLayout, PageHeader, CategoryOverviewActions, CategoriesTable],
    templateUrl: './categories.page.html',
    styleUrl: './categories.page.css',
    providers: [CategoriesService, CategoriesTableService, CategoryActionsService],
})
export class CategoriesPage implements OnInit {
    private readonly service: CategoriesService = inject(CategoriesService);
    private readonly tableService = inject(CategoriesTableService);
    private readonly categoryActionsService = inject(CategoryActionsService);
    private readonly toastService = inject(ToastService);
    private readonly dialogService: DialogService = inject(DialogService);
    private readonly router: Router = inject(Router);

    isLoadingComposite = signal(true);
    totalCategories = signal<number>(0);
    private readonly totalPages = signal<number>(0);
    private readonly currentPage = computed(() => this.service.paginationParams().page);
    readonly pageSize = 5;
    readonly pagination = computed(() =>
        createPagination({
            showPagination: true,
            page: this.currentPage(),
            size: this.pageSize,
            total: this.totalCategories(),
            pages: this.totalPages(),
        }),
    );
    categories = signal<Category[]>([]);
    rows: Signal<PersistedRecord<Category & EntityData>[]> = computed(() =>
        this.categories().map(toPersistedRecord),
    );

    ngOnInit(): void {
        this.loadPageComposite();
    }

    private loadPageComposite(): void {
        this.isLoadingComposite.set(true);
        this.service.getCompositeCategoriesPage().subscribe({
            next: (response) => {
                this.totalCategories.set(response.data.table.totalCount);
                this.totalPages.set(response.data.table.totalPages);
                this.categories.set(response.data.table.categories);
                this.registerTableEventHandlers();
                this.isLoadingComposite.set(false);
            },
            error: () => {
                this.isLoadingComposite.set(false);
                this.toastService.showError(
                    'Error al cargar las categorías. Por favor, inténtalo de nuevo.',
                );
            },
        });
    }

    private registerTableEventHandlers(): void {
        this.registerPageChangeHandler();
        this.registerCategoryActionHandler();
        this.registerToggleCategoryStatusHandler();
        this.registerToggleVisibilityHandler();
    }

    private registerToggleVisibilityHandler(): void {
        this.tableService.categoryVisibleInMenuChange$.subscribe((event) =>
            this.toggleVisibilityHandler(event),
        );
    }

    private toggleVisibilityHandler(event: CategoryVisibleInMenuChange): void {
        const { snapshot, newValue } = event;
        const category = this.findCategoryById(snapshot.data._recordKey);
        this.categoryActionsService
            .toggleCategoryVisibilityInMenu({
                id: snapshot.data._recordKey,
                visibleInMenu: newValue,
            })
            .subscribe({
                next: ({ data }) => this.onVisibilityChangeSuccess(data),
                error: () => this.onVisibilityChangeError(category, newValue),
            });
    }

    private onVisibilityChangeSuccess(category: Category | undefined): void {
        this.toastService.showSuccess(
            `Visibilidad en menú de la categoría "${category?.name}" actualizada correctamente.`,
        );
    }

    private onVisibilityChangeError(category: Category | undefined, newValue: boolean): void {
        this.revertCategoryVisibility(category?.id ?? '', newValue);
        this.toastService.showError(
            `Error al actualizar la visibilidad en menú de la categoría "${category?.name}".`,
        );
    }

    private registerToggleCategoryStatusHandler(): void {
        this.tableService.categoryStatusChange$.subscribe((event) =>
            this.toggleCategoryStatusHandler(event),
        );
    }

    private toggleCategoryStatusHandler(event: CategoryStatusChange): void {
        const { snapshot, newValue } = event;
        const category = this.findCategoryById(snapshot.data._recordKey);
        this.categoryActionsService
            .toggleCategoryActiveStatus({
                id: snapshot.data._recordKey,
                isActive: newValue,
            })
            .subscribe({
                next: ({ data }) => this.onStatusChangeSuccess(data),
                error: () => this.onStatusChangeError(category, newValue),
            });
    }

    private onStatusChangeSuccess(category: Category | undefined): void {
        this.toastService.showSuccess(
            `Estado de la categoría "${category?.name}" actualizado correctamente.`,
        );
    }

    private onStatusChangeError(category: Category | undefined, newValue: boolean): void {
        this.revertCategoryStatus(category?.id ?? '', newValue);
        this.toastService.showError(
            `Error al actualizar el estado de la categoría "${category?.name}".`,
        );
    }

    private registerCategoryActionHandler(): void {
        this.tableService.actionCategory$.subscribe((event) => this.handleCategoryAction(event));
    }

    private handleCategoryAction(event: CategoryTableActionEvent): void {
        const { action, record } = event;
        const categoryId = record.data._recordKey;
        if (action === 'edit') {
            this.handleEditCategory(categoryId);
        } else if (action === 'delete') {
            this.handleDeleteCategory(categoryId);
        } else if (action === 'view') {
            this.handleViewCategory(categoryId);
        } else if (action === 'viewSubcategories') {
            this.handleViewSubcategories(categoryId);
        }
    }

    private handleEditCategory(categoryId: string): void {
        this.router.navigate([`catalogs/categories/${categoryId}/edit`]);
    }

    private handleDeleteCategory(categoryId: string): void {
        this.dialogService
            .openConfirm({
                message: '¿Estás seguro de que deseas eliminar esta categoría?',
                confirmText: 'Eliminar',
                confirmVariant: 'danger',
            })
            .onClose$.subscribe((confirmed) => {
                if (confirmed) {
                    this.categoryActionsService.deleteCategory(categoryId).subscribe({
                        next: () => {
                            this.fetchCategories();
                            this.toastService.showSuccess('Categoría eliminada correctamente.');
                        },
                        error: () => {
                            this.toastService.showError('Error al eliminar la categoría.');
                        },
                    });
                }
            });
    }

    private handleViewCategory(categoryId: string): void {
        this.dialogService.open(CategoryDetailsDialog, categoryId, {
            title: 'Detalles de la Categoría',
            width: DIMENSIONS.MODAL.WIDTH,
            height: DIMENSIONS.MODAL.HEIGHT,
        });
    }

    private handleViewSubcategories(categoryId: string): void {
        this.router.navigate([`catalogs/categories/${categoryId}/subcategories`]);
    }

    private registerPageChangeHandler(): void {
        this.tableService.pageChange$.subscribe((newPage) => this.handlePageChange(newPage));
    }

    private handlePageChange(newPage: number): void {
        this.service.paginationParams.update((params) => ({
            ...params,
            page: newPage,
        }));
        this.fetchCategories();
    }

    onCategoryCreationRequest(strategy: RegisterCategoryStrategy): void {
        if (strategy === 'single') {
            this.registerSingleCategory();
        }
        if (strategy === 'multiple') {
            this.registerBulkCategory();
        }
    }

    private registerSingleCategory(): void {
        this.dialogService
            .open(RegisterCategoryDialog, undefined, {
                title: 'Nuevo Registro',
                width: DIMENSIONS.MODAL.WIDTH,
                height: DIMENSIONS.MODAL.HEIGHT,
            })
            .onClose$.subscribe((result) => {
                if (result) {
                    this.fetchCategories();
                    this.toastService.showSuccess('Categoría creada correctamente.');
                }
            });
    }

    private registerBulkCategory(): void {
        this.router.navigate(['catalogs/categories/bulk-registration']);
    }

    private fetchCategories(): void {
        this.service.fetchCategoriesPage().subscribe({
            next: (response) => {
                this.categories.set(response.data.categories);
                this.totalCategories.set(response.data.totalCount);
                this.totalPages.set(response.data.totalPages);
            },
        });
    }

    private revertCategoryStatus(id: string, failedValue: boolean): void {
        this.categories.update((categories) =>
            categories.map((c) => (c.id === id ? { ...c, isActive: !failedValue } : c)),
        );
    }

    private revertCategoryVisibility(id: string, failedValue: boolean): void {
        this.categories.update((categories) =>
            categories.map((c) => (c.id === id ? { ...c, visibleInMenu: !failedValue } : c)),
        );
    }

    private findCategoryById(id: string): Category | undefined {
        return this.categories().find((c) => c.id === id);
    }
}

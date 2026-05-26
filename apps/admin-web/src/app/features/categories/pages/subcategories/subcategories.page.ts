import {
  Component,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { PageLayout, Card, Button, PageHeader } from '../../../../shared/components';
import { SubcategoriesService } from './services/subcategories.service';
import {
  SyncCategoryChildrenResponse,
  SyncBatchOperation,
  SyncCreatedItem,
  SyncDeletedItem,
  SyncUpdatedItem,
} from './types';
import {
  buildSubcategoriesSyncFailureMessage,
  toUserFacingFailureReason,
} from './subcategories-sync-result-message.util';
import { toPersistedRecord } from '../../../../shared/mappers/entity-record.mapper';
import {
  createPagination,
  EntityData,
  FormActionsOptions,
  FormEvent,
} from '../../../../shared/interfaces';
import { CategoriesTable } from '../../components/categories-table/categories-table';
import { CategoryForm } from '../../components/forms/category-form/category-form';
import { CategoryFormData } from '../../components/forms/category-form/types';
import { CategoriesActionsOptions } from '../../components/category-table-actions/types';
import { CategoriesTableService } from '../../components/categories-table/categories-table.service';
import { CategoryRecord } from '../../components/categories-table/types';
import { SubcategoriesStateService } from './services/subcategories-state.service';
import { ToastService } from '../../../../shared/services/toast/toast.service';
import { Location } from '@angular/common';
import { DialogService } from '../../../../shared/services/dialog/dialog.service';
import { ParentCategorySummaryCard } from "../../components/parent-category-summary-card/parent-category-summary-card";
import { CategorySummary } from '../../components/parent-category-summary-card/types';

type SubcategorySyncError = {
  categoryName: string;
  operation: 'Crear' | 'Actualizar' | 'Eliminar';
  reason: string;
};

@Component({
  selector: 'app-subcategories-page',
  imports: [
    PageLayout,
    CategoriesTable,
    Card,
    CategoryForm,
    Button,
    PageHeader,
    ParentCategorySummaryCard
],
  templateUrl: './subcategories.page.html',
  styleUrl: './subcategories.page.css',
  providers: [
    SubcategoriesService,
    CategoriesTableService,
    SubcategoriesStateService,
  ],
})
export class SubcategoriesPage implements OnInit {
  private readonly subcategoriesService: SubcategoriesService =
    inject(SubcategoriesService);
  private readonly categoriesTableService: CategoriesTableService = inject(
    CategoriesTableService,
  );
  private readonly state: SubcategoriesStateService = inject(
    SubcategoriesStateService,
  );
  private readonly toastService = inject(ToastService);
  private readonly location = inject(Location);
  private readonly dialogService = inject(DialogService);

  parentCategory = signal<CategorySummary | null>(null);
  id = input.required<string>();
  isLoadingComposite = signal<boolean>(true);
  syncErrors = signal<SubcategorySyncError[]>([]);

  readonly paginationOptions = createPagination({ showPagination: false });
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

  readonly rows = this.state.rows;
  readonly hasPendingChanges = this.state.hasPendingChanges;

  ngOnInit(): void {
    this.loadComposite();
    this.subscribeToTableEvents();
  }

  private loadComposite(): void {
    this.isLoadingComposite.set(true);
    this.subcategoriesService.getSubcategoriesComposite(this.id()).subscribe({
      next: (response) => {
        this.parentCategory.set(response.data.category);
        const children = response.data.category.children || [];
        if (children.length > 0) {
          this.state.setPersisted(children.map(toPersistedRecord));
        }
        this.isLoadingComposite.set(false);
      },
      error: () => {
        this.isLoadingComposite.set(false);
      },
    });
  }

  private subscribeToTableEvents(): void {
    this.subscribeToStatusToggle();
    this.subscribeToVisibilityInMenuToggle();
    this.subscribeToActionCategory();
  }

  private subscribeToStatusToggle(): void {
    this.categoriesTableService.categoryStatusChange$.subscribe({
      next: ({ newValue, snapshot }) =>
        this.state.syncPendingChangeForField('isActive', newValue, snapshot),
    });
  }

  private subscribeToVisibilityInMenuToggle(): void {
    this.categoriesTableService.categoryVisibleInMenuChange$.subscribe({
      next: ({ newValue, snapshot }) =>
        this.state.syncPendingChangeForField(
          'visibleInMenu',
          newValue,
          snapshot,
        ),
    });
  }

  private subscribeToActionCategory(): void {
    this.categoriesTableService.actionCategory$.subscribe({
      next: (event) => {
        switch (event.action) {
          case 'delete':
            this.confirmToDeleteCategory(event.record);
            break;
          default:
            console.warn(`Unhandled action: ${event.action}`);
            break;
        }
      },
    });
  }

  private confirmToDeleteCategory(record: CategoryRecord<EntityData>): void {
    this.dialogService
      .openConfirm(
        {
          message: '¿Estás seguro de que deseas eliminar esta subcategoría?',
          confirmText: 'Sí, eliminar',
          cancelText: 'No, mantenerme aquí',
          confirmVariant: 'danger',
        },
        {
          title: 'Confirmar eliminación',
        },
      )
      .onClose$.subscribe((confirmed) => {
        if (confirmed) {
          this.state.markCategoryForDeletion(record.data._recordKey);
        }
      });
  }

  onSubmitCategory(event: FormEvent<CategoryFormData>): void {
    this.state.addDraft(event.data!);
  }

  onSaveChanges(): void {
    const news = this.state.getBulkSaveItems();
    const updates = this.state.getPendingChanges();
    const deletions = this.state.getDeleteIds();
    if (news.length === 0 && updates.length === 0 && deletions.length === 0)
      return;

    this.syncErrors.set([]);
    this.subcategoriesService
      .syncCategories(this.id(), {
        newCategories: news,
        updateCategories: updates,
        deleteCategories: deletions,
      })
      .subscribe({
        next: ({
          data: { created, updated, deleted },
        }: SyncCategoryChildrenResponse) => {
          this.state.applyCreatedItems(created);
          this.state.applyUpdatedItems(updated);
          this.state.applyDeletedItems(deleted);
          this.syncErrors.set(
            this.buildSyncErrors(created, updated, deleted, news, updates, deletions),
          );
          this.notifySyncResult(created, updated, deleted);
        },
        error: () => {
          this.toastService.showError(
            'Error al sincronizar las subcategorías.',
          );
        },
      });
  }

  dismissSyncErrors(): void {
    this.syncErrors.set([]);
  }

  onCancelChanges(): void {
    if (!this.hasPendingChanges()) {
      return this.goBack();
    }
    this.dialogService
      .openConfirm(
        {
          message:
            '¿Estás seguro de que deseas cancelar? Se perderán los cambios no guardados.',
          confirmText: 'Sí, cancelar',
          cancelText: 'No, mantenerme aquí',
          confirmVariant: 'danger',
        },
        {
          title: 'Confirmar cancelación',
        },
      )
      .onClose$.subscribe((confirmed) => {
        if (confirmed) {
          this.goBack();
        }
      });
  }

  private goBack(): void {
    this.location.back();
  }

  private notifySyncResult(
    created: SyncBatchOperation<SyncCreatedItem>,
    updated: SyncBatchOperation<SyncUpdatedItem>,
    deleted: SyncBatchOperation<SyncDeletedItem>,
  ): void {
    const totalSucceeded =
      created.succeeded.length +
      updated.succeeded.length +
      deleted.succeeded.length;
    const totalFailed =
      created.failed.length + updated.failed.length + deleted.failed.length;

    if (totalFailed === 0) {
      this.toastService.showSuccess(
        'Todos los cambios se aplicaron correctamente.',
      );
      return;
    }

    if (totalSucceeded === 0) {
      this.toastService.showError(
        buildSubcategoriesSyncFailureMessage(created, updated, deleted),
        'No se pudo sincronizar ningún cambio.',
      );
      return;
    }

    this.toastService.showSuccess(
      `${totalSucceeded} cambio(s) aplicado(s) correctamente.`,
    );
    this.toastService.showError(
      buildSubcategoriesSyncFailureMessage(created, updated, deleted),
      `${totalFailed} cambio(s) no pudieron sincronizarse.`,
    );
  }

  private buildSyncErrors(
    created: SyncBatchOperation<SyncCreatedItem>,
    updated: SyncBatchOperation<SyncUpdatedItem>,
    deleted: SyncBatchOperation<SyncDeletedItem>,
    newCategories: ReturnType<SubcategoriesStateService['getBulkSaveItems']>,
    updateCategories: ReturnType<SubcategoriesStateService['getPendingChanges']>,
    deleteCategories: ReturnType<SubcategoriesStateService['getDeleteIds']>,
  ): SubcategorySyncError[] {
    const createdNames = new Map(newCategories.map((item) => [item.key, item.name]));
    const updatedIds = new Set(updateCategories.map((item) => item.id));
    const deletedIds = new Set(deleteCategories);
    return [
      ...created.failed.map((item) => ({
        categoryName: item.key ? createdNames.get(item.key) : undefined,
        operation: 'Crear' as const,
        reason: item.reason,
      })),
      ...updated.failed.map((item) => ({
        categoryName:
          item.id && updatedIds.has(item.id)
            ? this.state.getCategoryNameById(item.id)
            : undefined,
        operation: 'Actualizar' as const,
        reason: item.reason,
      })),
      ...deleted.failed.map((item) => ({
        categoryName:
          item.id && deletedIds.has(item.id)
            ? this.state.getCategoryNameById(item.id)
            : undefined,
        operation: 'Eliminar' as const,
        reason: item.reason,
      })),
    ].map((item) => ({
      categoryName: item.categoryName ?? 'Categoría sin identificar',
      operation: item.operation,
      reason: toUserFacingFailureReason(item.reason),
    }));
  }
}

import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductVariantDetailsDialog } from '@product-variants/components/dialogs/product-variant-details/product-variant-details.dialog';
import { ProductVariantOverviewActions } from '@product-variants/components/product-variant-overview-actions/product-variant-overview-actions';
import { ProductVariantsTable } from '@product-variants/components/product-variants-table/product-variants-table';
import { ProductVariantsTableService } from '@product-variants/components/product-variants-table/product-variants-table.service';
import { ProductVariantTableActionEvent } from '@product-variants/components/product-variants-table/types';
import { ProductVariantActionsService } from '@product-variants/services/product-variant-actions/product-variant-actions.service';
import { createPagination, EntityData, PersistedRecord } from '@shared/interfaces';
import { toPersistedRecord } from '@shared/mappers/entity-record.mapper';
import { ProductVariant } from '@shared/models';
import { PageHeader, PageLayout } from '@shared/components';
import { DIMENSIONS } from '@shared/constants/dimensions.consts';
import { DialogService } from '@shared/services/dialog/dialog.service';
import { ToastService } from '@shared/services/toast/toast.service';
import { ProductVariantsPageService } from './product-variants.page.service';

@Component({
  selector: 'ecom-product-variants-page',
  imports: [PageLayout, PageHeader, ProductVariantOverviewActions, ProductVariantsTable],
  templateUrl: './product-variants.page.html',
  styleUrl: './product-variants.page.css',
  providers: [
    ProductVariantActionsService,
    ProductVariantsPageService,
    ProductVariantsTableService,
  ],
})
export class ProductVariantsPage implements OnInit {
  private readonly service = inject(ProductVariantsPageService);
  private readonly productVariantActionsService = inject(
    ProductVariantActionsService,
  );
  private readonly tableService = inject(ProductVariantsTableService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  protected readonly isLoadingComposite = signal(true);
  protected readonly totalVariants = signal(0);
  protected readonly variants = signal<ProductVariant[]>([]);
  protected readonly selectedProductId = signal<string | null>(null);
  protected readonly rows: Signal<PersistedRecord<ProductVariant & EntityData>[]> = computed(() =>
    this.variants().map((variant) => toPersistedRecord(variant)),
  );
  private readonly totalPages = signal(0);
  private readonly currentPage = computed(() => this.service.paginationParams().page);
  protected readonly pageSize = 5;
  protected readonly pagination = computed(() =>
    createPagination({
      showPagination: true,
      page: this.currentPage(),
      size: this.pageSize,
      total: this.totalVariants(),
      pages: this.totalPages(),
    }),
  );

  ngOnInit(): void {
    this.loadPageComposite();
  }

  private loadPageComposite(): void {
    this.isLoadingComposite.set(true);
    const productId = this.route.snapshot.queryParamMap.get('productId');
    this.selectedProductId.set(productId);
    this.fetchVariants(productId, true);
  }

  private fetchVariants(productId: string | null, registerHandlers = false): void {
    this.service.fetchVariants(productId).subscribe({
      next: ({ data }) => {
        const offset = data.pagination.offset;
        this.applyVariantsData(
          data.variants,
          offset?.totalCount ?? data.variants.length,
          offset?.totalPages ?? 1,
        );

        if (registerHandlers) {
          this.registerTableEventHandlers();
        }

        this.isLoadingComposite.set(false);
      },
      error: () => this.onLoadError(),
    });
  }

  private applyVariantsData(
    variants: ProductVariant[],
    totalCount: number,
    totalPages: number,
  ): void {
    this.variants.set(variants);
    this.totalVariants.set(totalCount);
    this.totalPages.set(totalPages);
  }

  private registerTableEventHandlers(): void {
    this.tableService.pageChange$.subscribe((newPage) =>
      this.handlePageChange(newPage),
    );
    this.tableService.actionProductVariant$.subscribe((event) =>
      this.handleProductVariantAction(event),
    );
  }

  private handlePageChange(newPage: number): void {
    this.service.paginationParams.update((params) => ({
      ...params,
      page: newPage,
    }));
    this.fetchVariants(this.selectedProductId());
  }

  protected onProductVariantCreationRequest(): void {
    this.router.navigate(['catalogs', 'product-variants', 'register']);
  }

  private handleProductVariantAction(event: ProductVariantTableActionEvent): void {
    if (event.action === 'view') {
      this.handleViewProductVariant(event.record.data._recordKey);
    } else if (event.action === 'edit') {
      this.handleEditProductVariant(event.record.data._recordKey);
    } else if (event.action === 'delete') {
      this.handleDeleteProductVariant(event.record.data._recordKey);
    }
  }

  private handleEditProductVariant(productVariantId: string): void {
    this.router.navigate([
      'catalogs',
      'product-variants',
      productVariantId,
      'edit',
    ]);
  }

  private handleViewProductVariant(productVariantId: string): void {
    this.dialogService.open(ProductVariantDetailsDialog, productVariantId, {
      title: 'Detalles de la variante',
      width: DIMENSIONS.MODAL.WIDTH,
      height: DIMENSIONS.MODAL.HEIGHT,
    });
  }

  private handleDeleteProductVariant(productVariantId: string): void {
    this.dialogService
      .openConfirm({
        message: '¿Estás seguro de que deseas eliminar esta variante?',
        confirmText: 'Eliminar',
        confirmVariant: 'danger',
      })
      .onClose$.subscribe((confirmed) => {
        if (confirmed) {
          this.deleteProductVariant(productVariantId);
        }
      });
  }

  private deleteProductVariant(productVariantId: string): void {
    this.productVariantActionsService
      .deleteProductVariant(productVariantId)
      .subscribe({
        next: () => this.onDeleteProductVariantSuccess(),
        error: () => this.onDeleteProductVariantError(),
      });
  }

  private onDeleteProductVariantSuccess(): void {
    this.fetchVariants(this.selectedProductId());
    this.toastService.showSuccess('Variante eliminada correctamente.');
  }

  private onDeleteProductVariantError(): void {
    this.toastService.showError('Error al eliminar la variante.');
  }

  private onLoadError(): void {
    this.isLoadingComposite.set(false);
    this.toastService.showError(
      'Error al cargar las variantes. Por favor, inténtalo de nuevo.',
    );
  }
}

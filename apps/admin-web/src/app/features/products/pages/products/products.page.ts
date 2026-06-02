import { Component, computed, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { PageLayout, PageHeader } from '../../../../shared/components';
import { ProductsPageService } from './products.page.service';
import { Product } from '../../../../shared/models';
import { toPersistedRecord } from '../../../../shared/mappers/entity-record.mapper';
import { ProductsTable } from '../../components/products-table/products-table';
import { createPagination } from '../../../../shared/interfaces';
import { ProductsTableService } from '../../components/products-table/products-table.service';
import { ProductOverviewActions } from '../../components/product-overview-actions/product-overview-actions';
import { RegisterProductStrategy } from '../../components/product-overview-actions/types';
import { DialogService } from '../../../../shared/services/dialog/dialog.service';
import { RegisterProductDialog } from '../../components/dialogs/register-product/register-product.dialog';
import { DIMENSIONS } from '../../../../shared/constants/dimensions.consts';
import { Router } from '@angular/router';
import { ProductActionsService } from '../../services/product-actions/product-actions.service';
import { ToastService } from '../../../../shared/services/toast/toast.service';
import {
    ProductFeaturedChange,
    ProductStatusChange,
    ProductTableActionEvent,
} from '../../components/products-table/types';
import { ProductDetailsDialog } from '../../components/dialogs/product-details/product-details.dialog';

@Component({
    selector: 'app-products-page',
    imports: [PageLayout, PageHeader, ProductsTable, ProductOverviewActions],
    templateUrl: './products.page.html',
    providers: [ProductsPageService, ProductsTableService, ProductActionsService],
})
export class ProductsPage implements OnInit {
    private readonly service: ProductsPageService = inject(ProductsPageService);
    private readonly tableService = inject(ProductsTableService);
    private readonly productActionsService = inject(ProductActionsService);
    private readonly dialogService = inject(DialogService);
    private readonly toastService = inject(ToastService);
    private readonly router = inject(Router);

    isLoadingComposite = signal<boolean>(false);

    products: WritableSignal<Product[]> = signal<Product[]>([]);
    rows = computed(() => this.products().map((product) => toPersistedRecord(product)));
    totalProducts = signal<number>(0);
    private readonly totalPages = signal<number>(0);
    private readonly currentPage = computed(() => this.service.paginationParams().page);
    private readonly pageSize = computed(() => this.service.paginationParams().pageSize);
    pagination = computed(() =>
        createPagination({
            showPagination: true,
            page: this.currentPage(),
            size: this.pageSize(),
            total: this.totalProducts(),
            pages: this.totalPages(),
        }),
    );

    ngOnInit(): void {
        this.loadComposite();
    }

    private loadComposite(): void {
        this.isLoadingComposite.set(true);
        this.service.getProductsPageComposite().subscribe({
            next: (response) => {
                this.products.set(response.data.products);
                this.totalProducts.set(response.data.totalCount);
                this.totalPages.set(response.data.totalPages);
                this.isLoadingComposite.set(false);
                this.registerTableEventHandlers();
            },
        });
    }

    private registerTableEventHandlers(): void {
        this.registerPaginationHandler();
        this.registerProductActionHandler();
        this.registerToggleProductStatusHandler();
        this.registerToggleProductFeaturedHandler();
    }

    private registerPaginationHandler(): void {
        this.tableService.pageChange$.subscribe({
            next: (page) => this.handlePageChange(page),
        });
    }

    private handlePageChange(page: number): void {
        this.service.paginationParams.update((params) => ({ ...params, page }));
        this.fetchProducts();
    }

    private registerProductActionHandler(): void {
        this.tableService.actionProduct$.subscribe((event) => this.handleProductAction(event));
    }

    private handleProductAction(event: ProductTableActionEvent): void {
        const { action, record } = event;
        const productId = record.data._recordKey;
        if (action === 'edit') {
            this.handleEditProduct(productId);
        } else if (action === 'delete') {
            this.handleDeleteProduct(productId);
        } else if (action === 'view') {
            this.handleViewProduct(productId);
        }
    }

    private handleEditProduct(productId: Product['id']): void {
        this.router.navigate([`catalogos/productos/${productId}/edit`]);
    }

    private handleViewProduct(productId: Product['id']): void {
        this.dialogService.open(ProductDetailsDialog, productId, {
            title: 'Detalles del Producto',
            width: DIMENSIONS.MODAL.WIDTH,
            height: DIMENSIONS.MODAL.HEIGHT,
        });
    }

    private handleDeleteProduct(productId: Product['id']): void {
        this.dialogService
            .openConfirm({
                message: '¿Estás seguro de que deseas eliminar este producto?',
                confirmText: 'Eliminar',
                confirmVariant: 'danger',
            })
            .onClose$.subscribe((confirmed) => {
                if (confirmed) {
                    this.productActionsService.deleteProduct(productId).subscribe({
                        next: () => {
                            this.fetchProducts();
                            this.toastService.showSuccess('Producto eliminado correctamente.');
                        },
                        error: () => {
                            this.toastService.showError('Error al eliminar el producto.');
                        },
                    });
                }
            });
    }

    private registerToggleProductStatusHandler(): void {
        this.tableService.productStatusChange$.subscribe((event) =>
            this.toggleProductStatusHandler(event),
        );
    }

    private toggleProductStatusHandler(event: ProductStatusChange): void {
        const { snapshot, newValue } = event;
        const product = this.findProductById(snapshot.data._recordKey);
        this.productActionsService
            .toggleProductActiveStatus({
                id: snapshot.data._recordKey,
                isActive: newValue,
            })
            .subscribe({
                next: ({ data }) =>
                    this.onStatusChangeSuccess(product, data.product),
                error: () => this.onStatusChangeError(product, newValue),
            });
    }

    private onStatusChangeSuccess(
        product: Product | undefined,
        updatedProduct: Product,
    ): void {
        this.products.update((products) =>
            products.map((item) =>
                item.id === updatedProduct.id ? updatedProduct : item,
            ),
        );
        this.toastService.showSuccess(
            `Estado del producto "${product?.name}" actualizado correctamente.`,
        );
    }

    private onStatusChangeError(
        product: Product | undefined,
        failedValue: boolean,
    ): void {
        this.revertProductStatus(product?.id ?? '', failedValue);
        this.toastService.showError(
            `Error al actualizar el estado del producto "${product?.name}".`,
        );
    }

    private registerToggleProductFeaturedHandler(): void {
        this.tableService.productFeaturedChange$.subscribe((event) =>
            this.toggleProductFeaturedHandler(event),
        );
    }

    private toggleProductFeaturedHandler(event: ProductFeaturedChange): void {
        const { snapshot, newValue } = event;
        const product = this.findProductById(snapshot.data._recordKey);
        this.productActionsService
            .toggleProductFeaturedStatus({
                id: snapshot.data._recordKey,
                isFeatured: newValue,
            })
            .subscribe({
                next: ({ data }) =>
                    this.onFeaturedChangeSuccess(product, data.product),
                error: () => this.onFeaturedChangeError(product, newValue),
            });
    }

    private onFeaturedChangeSuccess(
        product: Product | undefined,
        updatedProduct: Product,
    ): void {
        this.products.update((products) =>
            products.map((item) =>
                item.id === updatedProduct.id ? updatedProduct : item,
            ),
        );
        this.toastService.showSuccess(
            `Destacado del producto "${product?.name}" actualizado correctamente.`,
        );
    }

    private onFeaturedChangeError(
        product: Product | undefined,
        failedValue: boolean,
    ): void {
        this.revertProductFeatured(product?.id ?? '', failedValue);
        this.toastService.showError(
            `Error al actualizar el destacado del producto "${product?.name}".`,
        );
    }

    private fetchProducts(): void {
        this.service.fetchProducts().subscribe({
            next: (response) => {
                this.products.set(response.data.products);
                this.totalProducts.set(response.data.totalCount);
                this.totalPages.set(response.data.totalPages);
            },
        });
    }

    onProductCreationRequest(strategy: RegisterProductStrategy): void {
        if (strategy === 'single') {
            this.onRegisterSingleProduct();
        }
        if (strategy === 'multiple') {
            this.onRegisterMultipleProducts();
        }
    }

    private onRegisterSingleProduct(): void {
        this.dialogService
            .open(RegisterProductDialog, undefined, {
                title: 'Nuevo registro',
                width: DIMENSIONS.MODAL.WIDTH,
                height: DIMENSIONS.MODAL.HEIGHT,
            })
            .onClose$.subscribe({
                next: (result) => {
                    if (result) {
                        this.fetchProducts();
                    }
                },
            });
    }

    private onRegisterMultipleProducts(): void {
        this.router.navigate(['catalogos', 'productos', 'bulk-registration']);
    }

    private revertProductStatus(id: string, failedValue: boolean): void {
        this.products.update((products) =>
            products.map((product) =>
                product.id === id ? { ...product, isActive: !failedValue } : product,
            ),
        );
    }

    private revertProductFeatured(id: string, failedValue: boolean): void {
        this.products.update((products) =>
            products.map((product) =>
                product.id === id ? { ...product, isFeatured: !failedValue } : product,
            ),
        );
    }

    private findProductById(id: string): Product | undefined {
        return this.products().find((product) => product.id === id);
    }
}

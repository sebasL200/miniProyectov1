import { Location } from '@angular/common';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProductVariantForm } from '@product-variants/components/forms/product-variant-form/product-variant-form';
import { ProductVariantFormService } from '@product-variants/components/forms/product-variant-form/product-variant-form.service';
import {
  ProductVariantAttributeOption,
  ProductVariantFormData,
  ProductVariantProductOption,
} from '@product-variants/components/forms/product-variant-form/types';
import { getProductVariantErrorMessage } from '@product-variants/mappers/product-variant-error-message.mapper';
import { productVariantFormDataToCreateVariantRequest } from '@product-variants/mappers/product-variant-request.mapper';
import { ProductVariantActionsService } from '@product-variants/services/product-variant-actions/product-variant-actions.service';
import { AttributeProductVariantSummary } from '@product-variants/types/attribute.type';
import { ProductService } from '@products/services/product/product.service';
import { ProductsQueryService } from '@products/services/products-query/products-query.service';
import { Card, PageHeader, PageLayout } from '@shared/components';
import { CursorPaginationParams, FormEvent } from '@shared/interfaces';
import { ProductSummary } from '@shared/models';
import { DialogService } from '@shared/services/dialog/dialog.service';
import { ToastService } from '@shared/services/toast/toast.service';
import { Observable, debounceTime, map, of, switchMap, take } from 'rxjs';
import { WARNING_PRICING } from './consts';
import { ProductProductVariantSummary } from './types';

@Component({
  selector: 'ecom-register-product-variant-page',
  imports: [PageLayout, PageHeader, Card, ProductVariantForm],
  templateUrl: './register-product-variant.page.html',
  styleUrl: './register-product-variant.page.css',
  providers: [
    ProductsQueryService,
    ProductVariantActionsService,
    ProductVariantFormService,
  ],
})
export class RegisterProductVariantPage implements OnInit {
  private readonly productsQueryService = inject(ProductsQueryService);
  private readonly productService = inject(ProductService);
  private readonly productVariantActionsService = inject(
    ProductVariantActionsService,
  );
  private readonly productVariantFormService = inject(
    ProductVariantFormService,
  );
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly dialogService = inject(DialogService);
  private readonly toastService = inject(ToastService);

  private readonly productsCursorParams = signal<CursorPaginationParams>({
    paginationType: 'cursor',
    after: null,
    pageSize: 8,
    query: '',
  });
  readonly productsOptions = signal<ProductVariantProductOption[]>([]);
  readonly attributesOptions = signal<ProductVariantAttributeOption[]>([]);
  readonly directAttributes = signal<AttributeProductVariantSummary[]>([]);

  ngOnInit(): void {
    this.loadProducts(true);
    this.registerProductVariantFormHandlers();
  }

  onSubmit(event: FormEvent<ProductVariantFormData>): void {
    if (!event.data?.product) {
      this.toastService.showError(
        'Selecciona un producto para guardar la variante.',
      );
      return;
    }

    if (this.hasWarningPricing(event.data)) {
      this.confirmWarningPricing(event.data);
      return;
    }

    this.createProductVariant(
      productVariantFormDataToCreateVariantRequest(event.data),
    );
  }

  private confirmWarningPricing(data: ProductVariantFormData): void {
    const ref = this.dialogService.openConfirm(
      {
        message: `El precio base es menor o igual a $${WARNING_PRICING}. ¿Deseas continuar?`,
        confirmVariant: 'primary',
      },
      {
        title: 'Advertencia de precio',
      },
    );

    ref.onAfterClose$.pipe(take(1)).subscribe((confirmed) => {
      if (confirmed) {
        this.createProductVariant(
          productVariantFormDataToCreateVariantRequest(data),
        );
      }
    });
  }

  private createProductVariant(
    payload: ReturnType<typeof productVariantFormDataToCreateVariantRequest>,
  ): void {
    this.productVariantActionsService.createProductVariant(payload).subscribe({
      next: ({ data }) => this.onProductVariantCreated(data.variant.product.id),
      error: (error) => this.onCreateProductVariantError(error),
    });
  }

  onCanceled(event: FormEvent<ProductVariantFormData>): void {
    if (!event.hasChanges) {
      this.goBack();
      return;
    }

    this.confirmCancelChanges();
  }

  private confirmCancelChanges(): void {
    this.dialogService
      .openConfirm(
        {
          message: '¿Estás seguro de que quieres cancelar los cambios?',
          confirmText: 'Sí, cancelar',
          confirmVariant: 'danger',
          cancelText: 'No, seguir editando',
        },
        {
          title: 'Confirmar cancelación',
        },
      )
      .onAfterClose$.pipe(take(1))
      .subscribe((confirmed) => {
        if (confirmed) {
          this.goBack();
        }
      });
  }

  private loadProducts(reset = false): void {
    this.fetchProducts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ data }) => {
          this.applyProducts(data.products, reset);
          this.updateProductsCursor(data.nextCursor);
        },
      });
  }

  private registerProductVariantFormHandlers(): void {
    this.registerLoadMoreProductsHandler();
    this.registerSearchProductsHandler();
    this.registerSelectedProductChangeHandler();
  }

  private registerLoadMoreProductsHandler(): void {
    this.productVariantFormService.loadMoreProducts$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.handleLoadMoreProducts(),
      });
  }

  private registerSearchProductsHandler(): void {
    this.productVariantFormService.searchProducts$
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (query) => this.handleSearchProducts(query),
      });
  }

  private registerSelectedProductChangeHandler(): void {
    this.productVariantFormService.selectedProductChange$
      .pipe(
        switchMap((product) => this.fetchSelectedProduct(product)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (product) => this.applySelectedProduct(product),
      });
  }

  private fetchProducts() {
    return this.productsQueryService.getProductsCursor<ProductProductVariantSummary>(
      this.productsCursorParams(),
    );
  }

  private applyProducts(
    products: ProductProductVariantSummary[],
    reset: boolean,
  ): void {
    const options = this.toProductVariantProductOptions(products);
    this.productsOptions.update((prev) =>
      reset ? options : this.mergeProductOptions(prev, options),
    );
  }

  private updateProductsCursor(nextCursor: string | null): void {
    this.productsCursorParams.update((params) => ({
      ...params,
      after: nextCursor,
    }));
  }

  private handleLoadMoreProducts(): void {
    if (!this.hasMoreProducts()) {
      return;
    }

    this.loadProducts();
  }

  private handleSearchProducts(query: string): void {
    this.resetProductsSearch(query);
    this.loadProducts(true);
  }

  private hasMoreProducts(): boolean {
    return Boolean(this.productsCursorParams().after);
  }

  private hasWarningPricing(data: ProductVariantFormData): boolean {
    return this.isWarningPricing(data.price);
  }

  private isWarningPricing(value: number | null): boolean {
    return typeof value === 'number' && value <= WARNING_PRICING;
  }

  private resetProductsSearch(query: string): void {
    this.productsCursorParams.update((params) => ({
      ...params,
      query: query.trim(),
      after: null,
      before: null,
    }));
  }

  private fetchSelectedProduct(
    product: ProductSummary | null,
  ): Observable<ProductProductVariantSummary | null> {
    if (!product) {
      return of(null);
    }

    return this.productService
      .getProductById<ProductProductVariantSummary>(product.id)
      .pipe(map(({ data }) => data.product));
  }

  private applySelectedProduct(
    selectedProduct: ProductProductVariantSummary | null,
  ): void {
    if (!selectedProduct) {
      this.clearSelectedProductAttributes();
      return;
    }

    this.applySelectedProductAttributes(selectedProduct.attributes);
    this.applySelectedProductDirectAttributes(selectedProduct.directAttributes);
  }

  private clearSelectedProductAttributes(): void {
    this.attributesOptions.set([]);
    this.directAttributes.set([]);
  }

  private applySelectedProductAttributes(
    attributes: AttributeProductVariantSummary[],
  ): void {
    this.attributesOptions.set(
      this.toProductVariantAttributeOptions(attributes),
    );
  }

  private applySelectedProductDirectAttributes(
    attributes: AttributeProductVariantSummary[],
  ): void {
    this.directAttributes.set(attributes);
  }

  private toProductVariantProductOptions(
    products: ProductProductVariantSummary[],
  ): ProductVariantProductOption[] {
    return products.map((product) =>
      this.toProductVariantProductOption(product),
    );
  }

  private toProductVariantProductOption(
    product: ProductProductVariantSummary,
  ): ProductVariantProductOption {
    return {
      label: product.name,
      value: this.toProductSummary(product),
    };
  }

  private toProductSummary(
    product: ProductProductVariantSummary,
  ): ProductSummary {
    return {
      id: product.id,
      name: product.name,
      slug: product.slug,
    };
  }

  private toProductVariantAttributeOptions(
    attributes: AttributeProductVariantSummary[],
  ): ProductVariantAttributeOption[] {
    return attributes.map((attribute) =>
      this.toProductVariantAttributeOption(attribute),
    );
  }

  private toProductVariantAttributeOption(
    attribute: AttributeProductVariantSummary,
  ): ProductVariantAttributeOption {
    return {
      label: attribute.name,
      value: attribute,
    };
  }

  private mergeProductOptions(
    previous: ProductVariantProductOption[],
    next: ProductVariantProductOption[],
  ): ProductVariantProductOption[] {
    const existing = new Set(previous.map((option) => option.value.id));
    const missing = next.filter((option) => !existing.has(option.value.id));
    return [...previous, ...missing];
  }

  private onProductVariantCreated(productId: string): void {
    this.toastService.showSuccess('Variante creada correctamente.');
    this.navigateToProductVariants(productId);
  }

  private onCreateProductVariantError(error: unknown): void {
    this.toastService.showError(
      getProductVariantErrorMessage(error) ?? 'Error al crear la variante.',
    );
  }

  private navigateToProductVariants(productId?: string): void {
    this.router.navigate(['catalogs', 'product-variants'], {
      ...(productId ? { queryParams: { productId } } : {}),
    });
  }

  private goBack(): void {
    this.location.back();
  }

}

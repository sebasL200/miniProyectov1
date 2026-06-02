import { Location } from '@angular/common';
import { Component, computed, inject, input, OnInit, signal } from '@angular/core';
import { debounceTime } from 'rxjs';
import { AttributesQueryService } from '../../../attributes/services/attributes-query/attributes-query.service';
import { AttributesCursorResponse, AttributesNonPaginatedResponse, AttributesResponse } from '../../../attributes/services/attributes-query/types';
import { attributeToSummary } from '../../../attributes/utils/attribute-summary.mapper';
import { BrandsQueryService } from '../../../brands/services/brands-query/brands-query.service';
import { CategoriesQueryService } from '../../../categories/services/categories-query/categories-query.service';
import { ProductAttributeOption, ProductBrandOption, ProductCategoryOption, ProductFormData } from '../../components/forms/product-form/types';
import { ProductForm } from '../../components/forms/product-form/product-form';
import { ProductFormService } from '../../components/forms/product-form/product-form.service';
import { AdditionalAttributesSearchParams, CategoryAttributesSearchParams } from '../../components/dialogs/register-product/types';
import { productFormDataChangesToUpdateProductRequest, productToProductFormData } from '../../mappers/product-request.mapper';
import { ProductActionsService } from '../../services/product-actions/product-actions.service';
import { ProductService } from '../../services/product/product.service';
import { attributesToProductAttributeOptions } from '../../utils/product-attribute-option.utils';
import { brandToProductBrandOption } from '../../utils/product-brand-option.utils';
import { categoryToProductCategoryOption } from '../../utils/product-category-option.utils';
import { Card } from '../../../../shared/components/ui/card/card';
import { PageHeader } from '../../../../shared/components/page-header/page-header';
import { PageLayout } from '../../../../shared/components/page-layout/page-layout';
import { InputSelectOption } from '../../../../shared/components/ui/input-select/input-select.types';
import { CursorPaginationParams, NoPaginationParams } from '../../../../shared/interfaces/api.interface';
import { FormEvent } from '../../../../shared/interfaces/form.interface';
import { AttributeSummary } from '../../../../shared/models/attribute.model';
import { CategorySummary } from '../../../../shared/models/category.model';
import { Product } from '../../../../shared/models/product.model';
import { DialogService } from '../../../../shared/services/dialog/dialog.service';
import { ToastService } from '../../../../shared/services/toast/toast.service';

@Component({
  selector: 'ecom-edit-product.page',
  imports: [PageLayout, PageHeader, Card, ProductForm],
  templateUrl: './edit-product.page.html',
  providers: [
    ProductService,
    ProductActionsService,
    CategoriesQueryService,
    BrandsQueryService,
    AttributesQueryService,
    ProductFormService,
  ],
})
export class EditProductPage implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly productActionsService = inject(ProductActionsService);
  private readonly productFormService = inject(ProductFormService);
  private readonly categoriesQueryService = inject(CategoriesQueryService);
  private readonly brandsQueryService = inject(BrandsQueryService);
  private readonly attributesQueryService = inject(AttributesQueryService);
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);
  private readonly location = inject(Location);

  private readonly categoriesCursorParams = signal<CursorPaginationParams>({
    paginationType: 'cursor',
    after: '',
    pageSize: 8,
    query: '',
  });
  private readonly brandsCursorParams = signal<CursorPaginationParams>({
    paginationType: 'cursor',
    after: '',
    pageSize: 8,
    query: '',
  });
  private readonly attributesCursorParams = signal<CursorPaginationParams>({
    paginationType: 'cursor',
    after: '',
    pageSize: 8,
    query: '',
  });
  private readonly additionalAttributesSearchParams =
    signal<AdditionalAttributesSearchParams>({
      categoryIds: '',
      appliesToAll: false,
    });

  id = input.required<string>();
  product = signal<Product | null>(null);
  categoriesOptions = signal<ProductCategoryOption[]>([]);
  brandsOptions = signal<ProductBrandOption[]>([]);
  attributesOptions = signal<ProductAttributeOption[]>([]);
  isLoading = computed(() => this.product() === null);
  productFormData = computed(() => productToProductFormData(this.product()!));
  categoryDrivenAttributes = computed(() => {
    const product = this.product();
    return product ? this.toCategoryDrivenAttributes(product) : [];
  });

  ngOnInit(): void {
    this.loadProduct();
    this.loadCategories();
    this.loadBrands();
    this.registerProductFormHandlers();
  }

  onSubmit(event: FormEvent<ProductFormData>): void {
    const product = this.product();
    if (!product || !event.data || !event.changes) {
      return;
    }

    const payload = productFormDataChangesToUpdateProductRequest(
      this.normalizeProductFormChanges(event.changes, event.data, product),
      event.data,
    );

    if (Object.keys(payload).length === 0) {
      this.toastService.showError('No hay cambios editables para guardar.');
      return;
    }

    this.productActionsService.updateProduct(this.id(), payload).subscribe({
      next: ({ data }) => {
        this.product.set(data.product);
        this.ensureSelectedOptions(data.product);
        this.toastService.showSuccess('Producto actualizado exitosamente');
      },
      error: (error) => {
        this.toastService.showError(
          error?.error?.message ?? 'Error al actualizar el producto',
        );
      },
    });
  }

  onCanceled({ hasChanges }: FormEvent<ProductFormData>): void {
    if (!hasChanges) {
      this.goBack();
      return;
    }

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
      .onClose$.subscribe((confirmed) => {
        if (confirmed) {
          this.goBack();
        }
      });
  }

  private loadProduct(): void {
    this.productService.getProductById(this.id()).subscribe({
      next: ({ data }) => {
        this.product.set(data.product);
        this.ensureSelectedOptions(data.product);
        this.disableVariantSensitiveControls(data.product);
        this.initializeAttributeFilters(data.product.categories);
        this.fetchAttributes(true);
      },
      error: () => {
        this.toastService.showError('Error al cargar el producto');
        this.goBack();
      },
    });
  }

  private loadCategories(): void {
    this.categoriesQueryService.getCategoriesCursor(this.categoriesCursorParams()).subscribe({
      next: (response) => {
        this.categoriesOptions.update((prev) =>
          this.mergeOptions(
            prev,
            response.data.categories.map(categoryToProductCategoryOption),
          ),
        );
        this.categoriesCursorParams.update((prev) => ({
          ...prev,
          after: response.data.nextCursor,
        }));
      },
    });
  }

  private loadBrands(): void {
    this.brandsQueryService.getBrandsCursor(this.brandsCursorParams()).subscribe({
      next: (response) => {
        this.brandsOptions.update((prev) =>
          this.mergeOptions(prev, response.data.brands.map(brandToProductBrandOption)),
        );
        this.brandsCursorParams.update((prev) => ({
          ...prev,
          after: response.data.nextCursor,
        }));
      },
    });
  }

  private fetchAttributes(reset = false): void {
    if (!reset && !this.attributesCursorParams().after) return;

    if (reset) {
      this.attributesCursorParams.update((prev) => ({
        ...prev,
        after: undefined,
      }));
    }

    this.attributesQueryService
      .getAttributes(this.attributesCursorParams(), {
        ...this.additionalAttributesSearchParams(),
        appliesToAll: false,
      })
      .subscribe({
        next: (response) => {
          const cursorResponse = response as AttributesCursorResponse;
          const mapped = attributesToProductAttributeOptions(
            cursorResponse.data.attributes,
          );
          this.attributesOptions.update((prev) =>
            reset ? this.mergeOptions(this.selectedAttributeOptions(), mapped) : this.mergeOptions(prev, mapped),
          );
          this.attributesCursorParams.update((prev) => ({
            ...prev,
            after: cursorResponse.data.nextCursor,
          }));
        },
      });
  }

  private initializeAttributeFilters(categories: CategorySummary[]): void {
    const categoryIds = categories.map((category) => category.id).join(',');
    this.additionalAttributesSearchParams.set({
      categoryIds,
      appliesToAll: false,
    });
    this.attributesCursorParams.update((prev) => ({
      ...prev,
      exclude: categoryIds.length > 0 ? 'categoryIds' : undefined,
    }));
  }

  private registerProductFormHandlers(): void {
    this.productFormService.loadMoreCategories$.subscribe({
      next: () => this.handleLoadMoreCategories(),
    });
    this.productFormService.loadMoreBrands$.subscribe({
      next: () => this.handleLoadMoreBrands(),
    });
    this.productFormService.loadMoreAttributes$.subscribe({
      next: () => this.handleLoadMoreAttributes(),
    });
    this.productFormService.selectedCategoriesChange$
      .pipe(debounceTime(500))
      .subscribe({
        next: (categories) => {
          const categoryIds = categories.map((category) => category.id).join(',');
          this.additionalAttributesSearchParams.set({
            categoryIds,
            appliesToAll: false,
          });
          this.attributesCursorParams.update((prev) => ({
            ...prev,
            exclude: categoryIds.length > 0 ? 'categoryIds' : undefined,
          }));
          this.fetchAttributes(true);
          this.fetchAttributesByCategoryIds(categories);
        },
      });
  }

  private fetchAttributesByCategoryIds(categories: CategorySummary[]): void {
    if (categories.length === 0) {
      this.sendAttributesRequiredByCategories([]);
      return;
    }

    const additionalParams: CategoryAttributesSearchParams = {
      categoryIds: categories.map((category) => category.id).join(','),
      appliesToAll: true,
    };
    const params: NoPaginationParams = {
      paginationType: 'none',
      query: '',
    };

    this.attributesQueryService
      .getAttributes(params, {
        ...additionalParams,
        appliesToAll: true,
        or: 'categoryIds,appliesToAll',
      })
      .subscribe({
        next: (response: AttributesResponse) => {
          const nonPaginatedResponse = response as AttributesNonPaginatedResponse;
          this.sendAttributesRequiredByCategories(
            nonPaginatedResponse.data.attributes
              .map(attributeToSummary)
              .filter((attribute) => !this.isDirectProductAttribute(attribute)),
          );
        },
      });
  }

  private sendAttributesRequiredByCategories(attributes: AttributeSummary[]): void {
    this.productFormService.attributesByCategoriesLoaded$.next(attributes);
  }

  private disableVariantSensitiveControls(product: Product): void {
    this.productFormService.disableControl('attributes', product.variants.length > 0);
    this.productFormService.disableControl('tags', true);
  }

  private isDirectProductAttribute(attribute: AttributeSummary): boolean {
    return (
      this.product()?.directAttributes.some(
        (directAttribute) => directAttribute.id === attribute.id,
      ) ?? false
    );
  }

  private handleLoadMoreCategories(): void {
    if (!this.categoriesCursorParams().after) {
      return;
    }

    this.categoriesQueryService.getCategoriesCursor(this.categoriesCursorParams()).subscribe({
      next: (response) => {
        this.categoriesOptions.update((prev) =>
          this.mergeOptions(
            prev,
            response.data.categories.map(categoryToProductCategoryOption),
          ),
        );
        this.categoriesCursorParams.update((prev) => ({
          ...prev,
          after: response.data.nextCursor,
        }));
      },
    });
  }

  private handleLoadMoreBrands(): void {
    if (!this.brandsCursorParams().after) {
      return;
    }

    this.brandsQueryService.getBrandsCursor(this.brandsCursorParams()).subscribe({
      next: (response) => {
        this.brandsOptions.update((prev) =>
          this.mergeOptions(prev, response.data.brands.map(brandToProductBrandOption)),
        );
        this.brandsCursorParams.update((prev) => ({
          ...prev,
          after: response.data.nextCursor,
        }));
      },
    });
  }

  private handleLoadMoreAttributes(): void {
    this.fetchAttributes();
  }

  private ensureSelectedOptions(product: Product): void {
    this.categoriesOptions.update((prev) =>
      this.mergeOptions(prev, this.selectedCategoryOptions(product)),
    );

    if (product.brand) {
      this.brandsOptions.update((prev) =>
        this.mergeOptions(prev, [this.selectedBrandOption(product)]),
      );
    }

    this.attributesOptions.update((prev) =>
      this.mergeOptions(prev, this.selectedAttributeOptions(product)),
    );
  }

  private selectedCategoryOptions(product: Product): ProductCategoryOption[] {
    return product.categories.map((category) => ({
      label: category.name,
      value: category,
    }));
  }

  private selectedBrandOption(product: Product): ProductBrandOption {
    return {
      label: product.brand?.name ?? '',
      value: product.brand?.id ?? product.brandId ?? '',
    };
  }

  private selectedAttributeOptions(product = this.product()): ProductAttributeOption[] {
    return (
      product?.directAttributes.map((attribute) => ({
        label: attribute.name,
        value: attribute,
      })) ?? []
    );
  }

  private normalizeProductFormChanges(
    changes: Partial<ProductFormData>,
    data: ProductFormData,
    product: Product,
  ): Partial<ProductFormData> {
    return {
      ...changes,
      ...(changes.categories !== undefined &&
        this.hasSameIds(data.categories, product.categories) && {
          categories: undefined,
        }),
      ...(changes.attributes !== undefined &&
        this.hasSameIds(data.attributes, product.directAttributes) && {
          attributes: undefined,
        }),
    };
  }

  private hasSameIds(
    current: AttributeSummary[] | CategorySummary[],
    previous: AttributeSummary[] | CategorySummary[],
  ): boolean {
    const currentIds = current.map((item) => item.id).sort();
    const previousIds = previous.map((item) => item.id).sort();
    return JSON.stringify(currentIds) === JSON.stringify(previousIds);
  }

  private toCategoryDrivenAttributes(product: Product): AttributeSummary[] {
    const directAttributeIds = new Set(
      product.directAttributes.map((attribute) => attribute.id),
    );
    return product.attributes.filter((attribute) => !directAttributeIds.has(attribute.id));
  }

  private mergeOptions<T extends InputSelectOption>(
    previous: T[],
    next: T[],
  ): T[] {
    const optionKey = (option: T) => {
      const value = option.value;
      if (value !== null && typeof value === 'object' && 'id' in value) {
        return String(value.id);
      }
      return String(value);
    };
    const existing = new Set(previous.map(optionKey));
    const missing = next.filter((option) => !existing.has(optionKey(option)));
    return [...previous, ...missing];
  }

  private goBack(): void {
    this.location.back();
  }
}

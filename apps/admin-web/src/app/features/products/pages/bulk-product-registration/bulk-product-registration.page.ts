import { Location } from '@angular/common';
import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { debounceTime } from 'rxjs';
import { AttributesQueryService } from '../../../attributes/services/attributes-query/attributes-query.service';
import {
  AttributesCursorResponse,
  AttributesNonPaginatedResponse,
  AttributesResponse,
} from '../../../attributes/services/attributes-query/types';
import { attributeToSummary } from '../../../attributes/utils/attribute-summary.mapper';
import { attributesToProductAttributeOptions } from '../../utils/product-attribute-option.utils';
import { brandToProductBrandOption } from '../../utils/product-brand-option.utils';
import { categoryToProductCategoryOption } from '../../utils/product-category-option.utils';
import { BrandsQueryService } from '../../../brands/services/brands-query/brands-query.service';
import { CategoriesQueryService } from '../../../categories/services/categories-query/categories-query.service';
import { ProductForm } from '../../components/forms/product-form/product-form';
import { ProductFormService } from '../../components/forms/product-form/product-form.service';
import {
  ProductAttributeOption,
  ProductBrandOption,
  ProductCategoryOption,
  ProductFormData,
} from '../../components/forms/product-form/types';
import { ProductsTable } from '../../components/products-table/products-table';
import { ProductsTableService } from '../../components/products-table/products-table.service';
import { ProductRecord } from '../../components/products-table/types';
import { ProductTableActionsOptions } from '../../components/product-table-actions/types';
import {
  AdditionalAttributesSearchParams,
  CategoryAttributesSearchParams,
} from '../../components/dialogs/register-product/types';
import { productFormDataToCreateProductRequest } from '../../mappers/product-request.mapper';
import { AttributeSummary, CategorySummary } from '../../../../shared/models';
import { toDraftRecord } from '../../../../shared/mappers/entity-record.mapper';
import {
  createPagination,
  FormActionsOptions,
  FormEvent,
  NoPaginationParams,
} from '../../../../shared/interfaces';
import { Button, Card, PageHeader, PageLayout } from '../../../../shared/components';
import { DialogService } from '../../../../shared/services/dialog/dialog.service';
import { ToastService } from '../../../../shared/services/toast/toast.service';
import { BulkProductRegistrationPageService } from './bulk-product-registration.page.service';
import { BULK_PRODUCT_REGISTRATION_COLUMNS } from './consts';
import { BulkSaveProductItem, ProductDraft } from './types';

@Component({
  selector: 'app-bulk-product-registration-page',
  imports: [PageLayout, PageHeader, Button, Card, ProductForm, ProductsTable],
  templateUrl: './bulk-product-registration.page.html',
  providers: [
    BulkProductRegistrationPageService,
    CategoriesQueryService,
    BrandsQueryService,
    AttributesQueryService,
    ProductFormService,
    ProductsTableService,
  ],
})
export class BulkProductRegistrationPage implements OnInit {
  private readonly service = inject(BulkProductRegistrationPageService);
  private readonly productFormService = inject(ProductFormService);
  private readonly productsTableService = inject(ProductsTableService);
  private readonly toastService = inject(ToastService);
  private readonly dialogService = inject(DialogService);
  private readonly location = inject(Location);

  private additionalAttributesSearchParams =
    signal<AdditionalAttributesSearchParams>({
      categoryIds: '',
      appliesToAll: false,
    });

  productDrafts = signal<ProductDraft[]>([]);
  categoriesOptions = signal<ProductCategoryOption[]>([]);
  brandsOptions = signal<ProductBrandOption[]>([]);
  attributesOptions = signal<ProductAttributeOption[]>([]);

  readonly canSave = computed(() => this.productDrafts().length > 0);
  readonly columns = BULK_PRODUCT_REGISTRATION_COLUMNS;
  readonly pagination = createPagination({ showPagination: false });
  readonly tableActions: ProductTableActionsOptions = {
    canAddOffer: false,
    canDelete: true,
    canEdit: false,
    canView: false,
  };
  readonly formActions = new FormActionsOptions({
    submitButtonVariant: 'secondary',
    submitLabel: 'Agregar Registro',
    cancelLabel: 'Limpiar Formulario',
    cancelButtonVariant: 'ghost',
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadAttributes();
    this.registerProductFormHandlers();
    this.registerTableHandlers();
  }

  onCancel(event: FormEvent<ProductFormData>): void {
    if (event.hasChanges) {
      this.dialogService
        .openConfirm(
          {
            message:
              '¿Estás seguro que deseas limpiar el formulario? Se perderán los cambios no guardados.',
            confirmText: 'Sí, limpiar',
            confirmVariant: 'danger',
            cancelText: 'No, continuar editando',
          },
          {
            title: 'Confirmar limpieza de formulario',
          },
        )
        .onClose$.subscribe((confirmed) => {
          if (confirmed) {
            // TODO: call productForm clear when ProductForm exposes a public clear() method
            // this.productForm()?.clear(); // method not yet on ProductForm
          }
        });
    }
  }

  onSubmit(event: FormEvent<ProductFormData>): void {
    if (!event.data) {
      return;
    }
    const draft = toDraftRecord<ProductFormData>(event.data);
    this.productDrafts.update((drafts) => [...drafts, draft]);
  }

  onSave(): void {
    const products = this.productDrafts().map((draft) =>
      this.productDraftToBulkSaveProductItem(draft),
    );

    this.service.saveBatchProducts(products).subscribe({
      next: ({ success, data }) => {
        if (!success) {
          this.toastService.showError(
            'Ocurrió un error al registrar los productos.',
          );
          return;
        }

        if (data.succeeded.length > 0) {
          this.toastService.showSuccess(
            `${data.succeeded.length} productos registrados exitosamente.`,
          );
        }

        if (data.failed.length > 0) {
          this.toastService.showError(
            `${data.failed.length} productos no pudieron ser registrados.`,
          );
        }

        this.productDrafts.update((drafts) =>
          drafts.filter(
            (draft) =>
              !data.succeeded.some(
                (successItem) => successItem.key === draft.data._recordKey,
              ),
          ),
        );
      },
      error: () => {
        this.toastService.showError(
          'Ocurrió un error al registrar los productos.',
        );
      },
    });
  }

  onDiscardChanges(): void {
    if (this.productDrafts().length === 0) {
      this.goBack();
      return;
    }

    this.dialogService
      .openConfirm(
        {
          message:
            '¿Estás seguro que deseas cancelar? Se perderán los productos no guardados.',
          confirmText: 'Sí, cancelar',
          confirmVariant: 'danger',
          cancelText: 'No, continuar editando',
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

  private productDraftToBulkSaveProductItem(
    draft: ProductDraft,
  ): BulkSaveProductItem {
    return {
      key: draft.data._recordKey,
      ...productFormDataToCreateProductRequest(draft.data),
    };
  }

  private registerTableHandlers(): void {
    this.registerActionProductHandler();
  }

  private registerActionProductHandler(): void {
    this.productsTableService.actionProduct$.subscribe(({ action, record }) => {
      switch (action) {
        case 'delete':
          this.onDeleteProduct(record);
          break;
      }
    });
  }

  private onDeleteProduct(record: ProductRecord): void {
    this.productDrafts.update((drafts) =>
      drafts.filter(
        (draft) => draft.data._recordKey !== record.data._recordKey,
      ),
    );
  }

  private loadCategories(): void {
    this.service.searchCategories().subscribe({
      next: (response) => {
        this.categoriesOptions.set(
          response.data.categories.map(categoryToProductCategoryOption),
        );
        this.service.categoriesCursorParams.update((prev) => ({
          ...prev,
          after: response.data.nextCursor,
        }));
      },
    });
  }

  private loadBrands(): void {
    this.service.searchBrands().subscribe({
      next: (response) => {
        this.brandsOptions.set(
          response.data.brands.map(brandToProductBrandOption),
        );
        this.service.brandsCursorParams.update((prev) => ({
          ...prev,
          after: response.data.nextCursor,
        }));
      },
    });
  }

  private loadAttributes(): void {
    this.fetchAttributes(true);
  }

  private fetchAttributes(reset = false): void {
    if (!reset && !this.service.attributesCursorParams().after) return;

    if (reset) {
      this.service.attributesCursorParams.update((prev) => ({
        ...prev,
        after: undefined,
      }));
    }

    this.service
      .searchAttributes(this.additionalAttributesSearchParams())
      .subscribe({
        next: (response) => {
          const cursorResponse = response as AttributesCursorResponse;
          const mapped = attributesToProductAttributeOptions(
            cursorResponse.data.attributes,
          );
          if (reset) {
            this.attributesOptions.set(mapped);
          } else {
            this.attributesOptions.update((prev) => [...prev, ...mapped]);
          }
          this.service.attributesCursorParams.update((prev) => ({
            ...prev,
            after: cursorResponse.data.nextCursor,
          }));
        },
      });
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
          const categoryIds = categories
            .map((category) => category.id)
            .join(',');
          this.additionalAttributesSearchParams.set({
            categoryIds,
            appliesToAll: false,
          });
          this.service.attributesCursorParams.update((prev) => ({
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
    const categoryIds = categories.map((category) => category.id).join(',');
    const additionalParams: CategoryAttributesSearchParams = {
      categoryIds,
      appliesToAll: true,
    };
    const params: NoPaginationParams = {
      paginationType: 'none',
      query: '',
    };
    this.service.searchCategoryAttributes(additionalParams, params).subscribe({
      next: (response) => {
        const nonPaginatedResponse = response as AttributesNonPaginatedResponse;
        const attributeSummaries =
          nonPaginatedResponse.data.attributes.map(attributeToSummary);
        this.sendAttributesRequiredByCategories(attributeSummaries);
      },
    });
  }

  private sendAttributesRequiredByCategories(
    attributes: AttributeSummary[],
  ): void {
    this.productFormService.attributesByCategoriesLoaded$.next(attributes);
  }

  private handleLoadMoreCategories(): void {
    if (this.service.categoriesCursorParams().after) {
      this.service.searchCategories().subscribe({
        next: (response) => {
          this.categoriesOptions.update((prev) => [
            ...prev,
            ...response.data.categories.map(categoryToProductCategoryOption),
          ]);
          this.service.categoriesCursorParams.update((prev) => ({
            ...prev,
            after: response.data.nextCursor,
          }));
        },
      });
    }
  }

  private handleLoadMoreBrands(): void {
    if (this.service.brandsCursorParams().after) {
      this.service.searchBrands().subscribe({
        next: (response) => {
          this.brandsOptions.update((prev) => [
            ...prev,
            ...response.data.brands.map(brandToProductBrandOption),
          ]);
          this.service.brandsCursorParams.update((prev) => ({
            ...prev,
            after: response.data.nextCursor,
          }));
        },
      });
    }
  }

  private handleLoadMoreAttributes(): void {
    if (this.service.attributesCursorParams().after) {
      this.service
        .searchAttributes(this.additionalAttributesSearchParams())
        .subscribe({
          next: (response: AttributesResponse) => {
            const cursorResponse = response as AttributesCursorResponse;
            this.attributesOptions.update((prev) => [
              ...prev,
              ...attributesToProductAttributeOptions(
                cursorResponse.data.attributes,
              ),
            ]);
            this.service.attributesCursorParams.update((prev) => ({
              ...prev,
              after: cursorResponse.data.nextCursor,
            }));
          },
        });
    }
  }

  private goBack(): void {
    this.location.back();
  }
}

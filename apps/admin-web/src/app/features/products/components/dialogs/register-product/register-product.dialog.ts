import {
  Component,
  inject,
  OnInit,
  signal,
  WritableSignal,
} from '@angular/core';
import { IDialogComponent } from '../../../../../shared/components/ui/dialog/interfaces/dialog-component.interface';
import { DialogRef } from '../../../../../shared/components/ui/dialog/models/dialog-ref.model';
import { AttributeSummary } from '../../../../../shared/models/attribute.model';
import { CategorySummary } from '../../../../../shared/models/category.model';
import { Product } from '../../../../../shared/models/product.model';
import { ProductForm } from '../../forms/product-form/product-form';
import { RegisterProductService } from './register-product.service';
import { CategoriesQueryService } from '../../../../categories/services/categories-query/categories-query.service';
import { BrandsQueryService } from '../../../../brands/services/brands-query/brands-query.service';
import { AttributesQueryService } from '../../../../attributes/services/attributes-query/attributes-query.service';
import { ProductAttributeOption, ProductBrandOption, ProductCategoryOption, ProductFormData } from '../../forms/product-form/types';
import { categoryToProductCategoryOption } from '../../../utils/product-category-option.utils';
import { brandToProductBrandOption } from '../../../utils/product-brand-option.utils';
import { attributesToProductAttributeOptions } from '../../../utils/product-attribute-option.utils';
import { ProductFormService } from '../../forms/product-form/product-form.service';
import { debounceTime } from 'rxjs';
import {
  AdditionalAttributesSearchParams,
  CategoryAttributesSearchParams,
} from './types';
import { AttributesCursorResponse, AttributesNonPaginatedResponse, AttributesResponse } from '../../../../attributes/services/attributes-query/types';
import { NoPaginationParams } from '../../../../../shared/interfaces/api.interface';
import { FormEvent } from '../../../../../shared/interfaces/form.interface';
import { attributeToSummary } from '../../../../attributes/utils/attribute-summary.mapper';
import { ToastService } from '../../../../../shared/services/toast/toast.service';
import { productFormDataToCreateProductRequest } from '../../../mappers/product-request.mapper';

@Component({
  selector: 'ecom-register-product.dialog',
  imports: [ProductForm],
  templateUrl: './register-product.dialog.html',
  providers: [
    RegisterProductService,
    CategoriesQueryService,
    BrandsQueryService,
    AttributesQueryService,
    ProductFormService,
  ],
})
export class RegisterProductDialog
  implements OnInit, IDialogComponent<void, Product>
{
  private readonly service = inject(RegisterProductService);
  private readonly productFormService = inject(ProductFormService);
  private readonly toastService = inject(ToastService);
  private additionalAttributesSearchParams =
    signal<AdditionalAttributesSearchParams>({
      categoryIds: '',
      appliesToAll: false,
    });
  categoriesOptions = signal<ProductCategoryOption[]>([]);
  brandsOptions = signal<ProductBrandOption[]>([]);
  attributesOptions = signal<ProductAttributeOption[]>([]);

  private dialogRef: WritableSignal<DialogRef<void, Product> | null> =
    signal<DialogRef<void, Product> | null>(null);

  ngOnInit(): void {
    this.loadCategories();
    this.loadBrands();
    this.loadAttributes();
    this.registerProductFormHandlers();
  }

  onSubmit(event: FormEvent<ProductFormData>): void {
    if (!event.data) {
      return;
    }

    const request = productFormDataToCreateProductRequest(event.data);
    this.service.saveProduct(request).subscribe({
      next: (response) => {
        this.toastService.showSuccess('Producto creado correctamente.');
        this.dialogRef()?.close(response.data.product);
      },
      error: () => {
        this.toastService.showError('No se pudo crear el producto.');
      },
    });
  }

  setDialogRef(ref: DialogRef<void, Product>): void {
    this.dialogRef.set(ref);
  }

  private loadCategories() {
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

  private loadBrands() {
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

  private loadAttributes() {
    this.fetchAttributes(true);
  }

  private fetchAttributes(reset = false) {
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

  private registerProductFormHandlers() {
    this.registerLoadMoreCategoriesHandler();
    this.registerLoadMoreBrandsHandler();
    this.registerLoadMoreAttributesHandler();
    this.registerSelectedCategoriesChangeHandler();
  }

  private registerLoadMoreCategoriesHandler() {
    this.productFormService.loadMoreCategories$.subscribe({
      next: () => this.handleLoadMoreCategories(),
    });
  }

  private registerLoadMoreBrandsHandler() {
    this.productFormService.loadMoreBrands$.subscribe({
      next: () => this.handleLoadMoreBrands(),
    });
  }

  private registerLoadMoreAttributesHandler() {
    this.productFormService.loadMoreAttributes$.subscribe({
      next: () => this.handleLoadMoreAttributes(),
    });
  }

  private registerSelectedCategoriesChangeHandler() {
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

  private fetchAttributesByCategoryIds(categories: CategorySummary[]) {
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

  private sendAttributesRequiredByCategories(attributes: AttributeSummary[]) {
    this.productFormService.attributesByCategoriesLoaded$.next(attributes);
  }

  private handleLoadMoreCategories() {
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

  private handleLoadMoreBrands() {
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

  private handleLoadMoreAttributes() {
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
}

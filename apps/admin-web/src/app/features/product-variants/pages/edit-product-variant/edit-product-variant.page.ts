import { Location } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { ProductVariantForm } from '@product-variants/components/forms/product-variant-form/product-variant-form';
import { ProductVariantFormService } from '@product-variants/components/forms/product-variant-form/product-variant-form.service';
import {
  ProductVariantAttributeOption,
  ProductVariantFormData,
  ProductVariantProductOption,
} from '@product-variants/components/forms/product-variant-form/types';
import { getProductVariantErrorMessage } from '@product-variants/mappers/product-variant-error-message.mapper';
import {
  productVariantFormChangesToUpdateVariantRequest,
  productVariantToProductVariantFormData,
} from '@product-variants/mappers/product-variant-request.mapper';
import { ProductVariantActionsService } from '@product-variants/services/product-variant-actions/product-variant-actions.service';
import { ProductVariantService } from '@product-variants/services/product-variant/product-variant.service';
import { AttributeProductVariantSummary } from '@product-variants/types/attribute.type';
import { Card, PageHeader, PageLayout } from '@shared/components';
import { FormEvent } from '@shared/interfaces';
import { ProductVariant } from '@shared/models';
import { DialogService } from '@shared/services/dialog/dialog.service';
import { ToastService } from '@shared/services/toast/toast.service';

@Component({
  selector: 'ecom-edit-product-variant-page',
  imports: [PageLayout, PageHeader, Card, ProductVariantForm],
  templateUrl: './edit-product-variant.page.html',
  styleUrl: './edit-product-variant.page.css',
  providers: [
    ProductVariantActionsService,
    ProductVariantFormService,
    ProductVariantService,
  ],
})
export class EditProductVariantPage implements OnInit {
  private readonly productVariantService = inject(ProductVariantService);
  private readonly productVariantActionsService = inject(
    ProductVariantActionsService,
  );
  private readonly productVariantFormService = inject(
    ProductVariantFormService,
  );
  private readonly dialogService = inject(DialogService);
  private readonly location = inject(Location);
  private readonly toastService = inject(ToastService);

  readonly id = input.required<string>();
  private readonly variant = signal<ProductVariant | null>(null);
  readonly productsOptions = signal<ProductVariantProductOption[]>([]);
  readonly attributesOptions = signal<ProductVariantAttributeOption[]>([]);
  readonly directAttributes = signal<AttributeProductVariantSummary[]>([]);
  readonly isLoading = computed(() => this.variant() === null);
  readonly initialData = computed(() =>
    this.toProductVariantFormData(this.variant()!),
  );

  ngOnInit(): void {
    this.loadProductVariant();
  }

  onSubmit(event: FormEvent<ProductVariantFormData>): void {
    this.submitActionHandler(event);
  }

  onCanceled(event: FormEvent<ProductVariantFormData>): void {
    this.cancelActionHandler(event);
  }

  private loadProductVariant(): void {
    this.productVariantService.getProductVariantById(this.id()).subscribe({
      next: ({ data }) => {
        this.applyProductVariant(data.variant);
        this.disableReadOnlyFormControls();
      },
      error: () => {
        this.toastService.showError('Error al cargar la variante.');
        this.goBack();
      },
    });
  }

  private applyProductVariant(variant: ProductVariant): void {
    this.variant.set(variant);
    this.applyProductVariantOptions(variant);
  }

  private submitActionHandler(event: FormEvent<ProductVariantFormData>): void {
    if (!event.data) {
      return;
    }

    const changes = this.normalizeProductVariantFormChanges(
      event.changes ?? {},
      event.data,
    );
    const payload = productVariantFormChangesToUpdateVariantRequest(
      changes,
      event.data,
    );

    if (Object.keys(payload).length === 0) {
      return;
    }

    this.productVariantActionsService
      .updateProductVariant(this.id(), payload)
      .subscribe({
        next: ({ data }) => {
          this.applyProductVariant(data.variant);
          this.toastService.showSuccess('Variante actualizada correctamente.');
        },
        error: (error) => this.onUpdateProductVariantError(error),
      });
  }

  private cancelActionHandler({
    hasChanges,
  }: FormEvent<ProductVariantFormData>): void {
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

  private applyProductVariantOptions(variant: ProductVariant): void {
    this.productsOptions.set([
      {
        label: variant.product.name,
        value: variant.product,
      },
    ]);
    this.attributesOptions.set(
      variant.attributes.map((attribute) => ({
        label: attribute.name,
        value: this.toAttributeProductVariantSummary(attribute),
      })),
    );
    this.directAttributes.set(
      variant.directAttributes.map((attribute) =>
        this.toAttributeProductVariantSummary(attribute),
      ),
    );
  }

  private disableReadOnlyFormControls(): void {
    this.productVariantFormService.disableControl('product', true);
    this.productVariantFormService.disableControl('name', true);
  }

  private normalizeProductVariantFormChanges(
    changes: Partial<ProductVariantFormData>,
    data: ProductVariantFormData,
  ): Partial<ProductVariantFormData> {
    const initialData = this.initialData();

    return {
      ...changes,
      product: undefined,
      name: undefined,
      attributes: undefined,
      ...(changes.images !== undefined &&
        this.hasSameJsonValue(data.images, initialData.images) && {
          images: undefined,
        }),
      ...(changes.attributeValues !== undefined &&
        this.hasSameAttributeValues(
          data.attributeValues,
          initialData.attributeValues,
        ) && {
          attributeValues: undefined,
        }),
      ...(changes.dimensions !== undefined &&
        this.hasSameJsonValue(data.dimensions, initialData.dimensions) && {
          dimensions: undefined,
        }),
    };
  }

  private hasSameJsonValue<T>(current: T, initial: T): boolean {
    return JSON.stringify(current) === JSON.stringify(initial);
  }

  private hasSameAttributeValues(
    current: ProductVariantFormData['attributeValues'],
    initial: ProductVariantFormData['attributeValues'],
  ): boolean {
    return (
      JSON.stringify(this.toComparableAttributeValues(current)) ===
      JSON.stringify(this.toComparableAttributeValues(initial))
    );
  }

  private toComparableAttributeValues(
    values: ProductVariantFormData['attributeValues'],
  ): { attributeId: string; value: string }[] {
    return values
      .map((item) => ({
        attributeId: item.attribute.id,
        value: item.value,
      }))
      .sort((a, b) => a.attributeId.localeCompare(b.attributeId));
  }

  private toAttributeProductVariantSummary(attribute: {
    id: string;
    name: string;
    slug: string;
    isRequired?: boolean;
  }): AttributeProductVariantSummary {
    return {
      id: attribute.id,
      name: attribute.name,
      slug: attribute.slug,
      isRequired: attribute.isRequired ?? false,
    };
  }

  private toProductVariantFormData(
    variant: ProductVariant,
  ): ProductVariantFormData {
    return productVariantToProductVariantFormData(variant);
  }

  private onUpdateProductVariantError(error: unknown): void {
    this.toastService.showError(
      getProductVariantErrorMessage(error) ?? 'Error al actualizar la variante.',
    );
  }

  private goBack(): void {
    this.location.back();
  }
}

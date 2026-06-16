import {
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  Signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  FormErrorMessage,
  InputCurrency,
  InputImageUpload,
  InputRichTextarea,
  InputSelect,
  InputText,
  InputImageUploadConfig,
  Label,
  Switch,
} from '@shared/components';
import { FormActions } from '@shared/components/form-actions/form-actions';
import { FormDivider } from '@shared/components/ui/form-divider/form-divider';
import {
  ExtractValue,
  FormActionsOptions,
  FormComponent,
  FormEvent,
} from '@shared/interfaces';
import {
  DEFAULT_PRODUCT_VARIANT_FORM_DATA,
  PRODUCT_VARIANT_ALLOWED_IMAGE_TYPES,
  PRODUCT_VARIANT_IMAGE_MAX_DATA_URL_LENGTH,
  PRODUCT_VARIANT_IMAGE_MAX_FILE_SIZE_BYTES,
} from './consts';
import { AttributeProductVariantSummary } from '@product-variants/types/attribute.type';
import type {
  ProductVariantAttributeOption,
  ProductVariantAttributeValueFormData,
  ProductVariantDimensionsFormSchema,
  ProductVariantFormData,
  ProductVariantFormControlName,
  ProductVariantFormSchema,
  ProductVariantProductOption,
} from './types';
import { ProductVariantFormService } from './product-variant-form.service';
import { ProductVariantAttributesTable } from './components/product-variant-attributes-table/product-variant-attributes-table';
import {
  productVariantBarcodeGtinValidator,
  productVariantEffectiveAttributeValuesValidator,
  productVariantMeasureValidator,
  productVariantNonNegativeIntegerValidator,
  productVariantSkuValidator,
  productVariantWeightValidator,
} from './validations';

const PRODUCT_DEPENDENT_CONTROLS: ProductVariantFormControlName[] = [
  'name',
  'sku',
  'price',
  'minimumStock',
  'barcode',
  'description',
  'isActive',
  'images',
  'dimensions',
  'attributes',
  'attributeValues',
];

@Component({
  selector: 'ecom-product-variant-form',
  imports: [
    ReactiveFormsModule,
    FormDivider,
    Label,
    FormErrorMessage,
    FormActions,
    InputCurrency,
    InputImageUpload,
    InputSelect,
    InputText,
    InputRichTextarea,
    Switch,
    ProductVariantAttributesTable,
  ],
  templateUrl: './product-variant-form.html',
  styleUrl: './product-variant-form.css',
})
export class ProductVariantForm
  extends FormComponent<ProductVariantFormSchema>
  implements OnInit
{
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly service = inject(ProductVariantFormService);
  private readonly destroyRef = inject(DestroyRef);
  private serviceDisabledControls: Partial<
    Record<ProductVariantFormControlName, boolean>
  > = {};

  protected readonly imageUploadConfig: InputImageUploadConfig = {
    valueType: 'data-url',
    multiple: true,
    allowedTypes: PRODUCT_VARIANT_ALLOWED_IMAGE_TYPES,
    maxFileSizeBytes: PRODUCT_VARIANT_IMAGE_MAX_FILE_SIZE_BYTES,
    maxDataUrlLength: PRODUCT_VARIANT_IMAGE_MAX_DATA_URL_LENGTH,
  };

  readonly productsOptions: InputSignal<ProductVariantProductOption[]> = input<
    ProductVariantProductOption[]
  >([]);
  readonly attributesOptions: InputSignal<ProductVariantAttributeOption[]> =
    input<ProductVariantAttributeOption[]>([]);
  readonly directAttributes: InputSignal<AttributeProductVariantSummary[]> =
    input<AttributeProductVariantSummary[]>([]);

  private readonly effectiveAttributes = computed(() =>
    this.attributesOptions().map((option) => option.value),
  );

  protected readonly effectiveAttributeOptions = computed(() =>
    this.attributesOptions().map((option) =>
      this.toEffectiveAttributeOption(option),
    ),
  );

  override initialData: InputSignal<ExtractValue<ProductVariantFormSchema>> =
    input(DEFAULT_PRODUCT_VARIANT_FORM_DATA);

  override actions: InputSignal<FormActionsOptions> = input(
    this.defaultActions,
  );

  override submitted: OutputEmitterRef<FormEvent<ProductVariantFormData>> =
    output<FormEvent<ProductVariantFormData>>();

  override canceled: OutputEmitterRef<FormEvent<ProductVariantFormData>> =
    output<FormEvent<ProductVariantFormData>>();

  override formActions: Signal<FormActions | undefined> =
    viewChild(FormActions);

  override formGroup: FormGroup<ProductVariantFormSchema> =
    this.fb.group<ProductVariantFormSchema>({
      product: this.fb.nonNullable.control(null, {
        validators: [Validators.required],
      }),
      name: this.fb.nonNullable.control('', {
        validators: [Validators.required],
      }),
      sku: this.fb.nonNullable.control('', {
        validators: [Validators.required, productVariantSkuValidator()],
      }),
      price: this.fb.control<number | null>(null, [Validators.min(0)]),
      minimumStock: this.fb.nonNullable.control<string>('0', [
        Validators.required,
        productVariantNonNegativeIntegerValidator(),
      ]),
      barcode: this.fb.nonNullable.control('', {
        validators: [productVariantBarcodeGtinValidator(), Validators.required],
      }),
      description: this.fb.nonNullable.control('', [
        Validators.required,
        Validators.maxLength(2000),
      ]),
      isActive: this.fb.nonNullable.control<boolean>(true),
      images: this.fb.nonNullable.control<string[]>([], [Validators.required]),
      dimensions: this.fb.group<ProductVariantDimensionsFormSchema>({
        width: this.fb.nonNullable.control<string>('', [
          productVariantMeasureValidator(),
        ]),
        height: this.fb.nonNullable.control<string>('', [
          productVariantMeasureValidator(),
        ]),
        length: this.fb.nonNullable.control<string>('', [
          productVariantMeasureValidator(),
        ]),
        weight: this.fb.nonNullable.control<string>('', [
          Validators.required,
          productVariantWeightValidator(),
        ]),
      }),
      attributes: this.fb.nonNullable.control<AttributeProductVariantSummary[]>(
        [],
      ),
      attributeValues: this.fb.nonNullable.control<
        ProductVariantAttributeValueFormData[]
      >([], {
        validators: [productVariantEffectiveAttributeValuesValidator()],
      }),
    });

  constructor() {
    super();
    this.setProductDependentControlsDisabled(true);

    afterNextRender(() => {
      this.formGroup.controls.product.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((product) => {
          this.onSelectedProductChange();
          this.service.selectedProductChange$.next(product);
        });

      this.formGroup.controls.attributes.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((attributes) => {
          const effectiveAttributes =
            this.ensureRequiredAttributesSelected(attributes);
          this.syncAttributeValuesWithAttributes(effectiveAttributes);
        });

      this.formGroup.controls.attributeValues.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((values) => {
          this.syncAttributesWithAttributeValues(values);
        });
    });

    effect(() => {
      this.onEffectiveAttributesLoaded(this.effectiveAttributes());
    });

    effect(() => {
      this.initialData().product;
      this.updateProductDependentControlStates();
    });

    effect((onCleanup) => {
      const formActions = this.formActions();
      if (!formActions) {
        return;
      }

      const cancelSub = formActions.cancel.subscribe(() => {
        const snapshot = structuredClone(
          this.formGroup.getRawValue() as ProductVariantFormData,
        );

        queueMicrotask(() => this.restoreCanceledFormValue(snapshot));
      });

      onCleanup(() => {
        cancelSub.unsubscribe();
      });
    });
  }

  ngOnInit(): void {
    this.registerDisableControlHandler();
  }

  loadMoreProducts(): void {
    this.service.loadMoreProducts$.next();
  }

  searchProducts(query: string): void {
    this.service.searchProducts$.next(query);
  }

  onSubmit(): void {
    this.submit();
  }

  selectedAttributes(): AttributeProductVariantSummary[] {
    return this.formGroup.controls.attributes.value;
  }

  private restoreCanceledFormValue(snapshot: ProductVariantFormData): void {
    this.formGroup.reset(snapshot, { emitEvent: false });
    this.hasChanges.set(true);
    this.updateProductDependentControlStates();
  }

  private onSelectedProductChange(): void {
    this.updateProductDependentControlStates();
  }

  private setProductDependentControlsDisabled(disabled: boolean): void {
    PRODUCT_DEPENDENT_CONTROLS.forEach((controlName) =>
      this.setControlDisabled(controlName, disabled),
    );
  }

  private updateProductDependentControlStates(): void {
    PRODUCT_DEPENDENT_CONTROLS.forEach((controlName) =>
      this.applyEffectiveControlDisabledState(controlName),
    );
  }

  private registerDisableControlHandler(): void {
    this.service.disabledControls$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((disabledControls) => {
        this.serviceDisabledControls = disabledControls;
        Object.entries(disabledControls).forEach(([controlName]) => {
          this.applyEffectiveControlDisabledState(
            controlName as ProductVariantFormControlName,
          );
        });
      });
  }

  private applyEffectiveControlDisabledState(
    controlName: ProductVariantFormControlName,
  ): void {
    this.setControlDisabled(
      controlName,
      this.shouldDisableControl(controlName),
    );
  }

  private shouldDisableControl(
    controlName: ProductVariantFormControlName,
  ): boolean {
    return Boolean(
      this.serviceDisabledControls[controlName] ||
        (this.isProductDependentControl(controlName) &&
          !this.formGroup.controls.product.value),
    );
  }

  private isProductDependentControl(
    controlName: ProductVariantFormControlName,
  ): boolean {
    return PRODUCT_DEPENDENT_CONTROLS.includes(controlName);
  }

  private setControlDisabled(
    controlName: ProductVariantFormControlName,
    disabled: boolean | undefined,
  ): void {
    const control = this.formGroup.controls[controlName];
    if (!control) {
      return;
    }

    if (disabled) {
      control.disable({ emitEvent: false });
      return;
    }

    control.enable({ emitEvent: false });
  }

  private onEffectiveAttributesLoaded(
    attributes: AttributeProductVariantSummary[],
  ): void {
    const nextAttributes = this.uniqueAttributes([
      ...this.formGroup.controls.attributes.value,
      ...attributes,
    ]);
    this.formGroup.controls.attributes.setValue(nextAttributes, {
      emitEvent: false,
    });
    this.syncAttributeValuesWithAttributes(nextAttributes);
    this.formGroup.controls.attributes.updateValueAndValidity();
  }

  private ensureRequiredAttributesSelected(
    attributes: AttributeProductVariantSummary[],
  ): AttributeProductVariantSummary[] {
    const requiredAttributes = this.effectiveAttributes();
    const selectedIds = new Set(attributes.map((attribute) => attribute.id));
    const missingRequiredAttributes = requiredAttributes.filter(
      (attribute) => !selectedIds.has(attribute.id),
    );

    if (missingRequiredAttributes.length === 0) {
      return attributes;
    }

    const nextAttributes = this.uniqueAttributes([
      ...attributes,
      ...missingRequiredAttributes,
    ]);
    this.formGroup.controls.attributes.setValue(nextAttributes, {
      emitEvent: false,
    });
    return nextAttributes;
  }

  private toEffectiveAttributeOption(
    option: ProductVariantAttributeOption,
  ): ProductVariantAttributeOption {
    return {
      ...option,
      label: option.value.isRequired
        ? `${option.label} (obligatorio)`
        : option.label,
      disabled: true,
    };
  }

  private syncAttributeValuesWithAttributes(
    attributes: AttributeProductVariantSummary[],
  ): void {
    const currentValueByAttributeId = new Map(
      this.formGroup.controls.attributeValues.value.map((item) => [
        item.attribute.id,
        item.value,
      ]),
    );

    const nextValues = attributes.map((attribute) => ({
      attribute,
      value: currentValueByAttributeId.get(attribute.id) ?? '',
    }));

    this.formGroup.controls.attributeValues.setValue(nextValues);
    this.formGroup.controls.attributeValues.updateValueAndValidity({
      emitEvent: false,
    });
  }

  private syncAttributesWithAttributeValues(
    values: ProductVariantAttributeValueFormData[],
  ): void {
    const nextAttributes = this.ensureRequiredAttributesSelected(
      values.map((item) => item.attribute),
    );
    this.formGroup.controls.attributes.setValue(nextAttributes, {
      emitEvent: false,
    });
  }

  private uniqueAttributes(
    attributes: AttributeProductVariantSummary[],
  ): AttributeProductVariantSummary[] {
    const seen = new Map<string, AttributeProductVariantSummary>();

    for (const attribute of attributes) {
      if (!seen.has(attribute.id)) {
        seen.set(attribute.id, attribute);
      }
    }

    return [...seen.values()];
  }

}

import {
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  OnInit,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { FormDivider } from '../../../../../shared/components/ui/form-divider/form-divider';
import { Label } from '../../../../../shared/components/ui/label/label';
import { InputCurrency } from '../../../../../shared/components/ui/input-currency/input-currency';
import { InputText } from '../../../../../shared/components/ui/input-text/input-text';
import { InputRichTextarea } from '../../../../../shared/components/ui/input-rich-textarea/input-rich-textarea';
import { InputTextarea } from '../../../../../shared/components/ui/input-textarea/input-textarea';
import { InputSelect } from '../../../../../shared/components/ui/input-select/input-select';
import { Switch } from '../../../../../shared/components/ui/switch/switch';
import { FormErrorMessage } from '../../../../../shared/components/ui/form-error-message/form-error-message';
import { Badge } from '../../../../../shared/components/ui/badge/badge';
import { Tooltip } from '../../../../../shared/components/ui/tooltip/tooltip';
import { FormActions } from '../../../../../shared/components/form-actions/form-actions';
import { ExtractValue, FormActionsOptions, FormComponent, FormEvent } from '../../../../../shared/interfaces/form.interface';
import {
  ProductCategoryOption,
  ProductAttributeOption,
  ProductBrandOption,
  ProductDimensionsFormSchema,
  ProductFormData,
  ProductFormSchema,
} from './types';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  ɵInternalFormsSharedModule,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DEFAULT_PRODUCT_FORM_DATA } from './consts';
import { AttributeSummary } from '../../../../../shared/models/attribute.model';
import { CategorySummary } from '../../../../../shared/models/category.model';
import { ProductFormService } from './product-form.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faX, faInfo } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'ecom-product-form',
  imports: [
    ReactiveFormsModule,
    FormDivider,
    Label,
    InputText,
    InputRichTextarea,
    InputTextarea,
    InputSelect,
    Switch,
    InputCurrency,
    FormActions,
    ɵInternalFormsSharedModule,
    FormErrorMessage,
    Badge,
    FaIconComponent,
    Tooltip,
  ],
  templateUrl: './product-form.html',
})
export class ProductForm
  extends FormComponent<ProductFormSchema>
  implements OnInit
{
  private readonly fb: FormBuilder = inject(FormBuilder);
  private readonly service = inject(ProductFormService);
  private readonly destroyRef = inject(DestroyRef);

  faX = faX;
  faInfo = faInfo;

  categoriesOptions: InputSignal<ProductCategoryOption[]> = input<
    ProductCategoryOption[]
  >([]);
  brandsOptions: InputSignal<ProductBrandOption[]> = input<
    ProductBrandOption[]
  >([]);
  attributesOptions: InputSignal<ProductAttributeOption[]> = input<
    ProductAttributeOption[]
  >([]);
  categoryDrivenAttributes: InputSignal<AttributeSummary[]> = input<
    AttributeSummary[]
  >([]);

  protected attributesRequired = signal<AttributeSummary[]>([]);
  protected readonly isTagsDisabled = computed(
    () => this.formGroup.controls.tags.disabled,
  );

  override actions: InputSignal<FormActionsOptions> = input(
    this.defaultActions,
  );
  override formActions: Signal<FormActions | undefined> =
    viewChild(FormActions);
  override initialData: InputSignal<ExtractValue<ProductFormSchema>> = input(
    DEFAULT_PRODUCT_FORM_DATA,
  );

  override submitted: OutputEmitterRef<FormEvent<ProductFormData>> =
    output<FormEvent<ProductFormData>>();

  override canceled: OutputEmitterRef<FormEvent<ProductFormData>> =
    output<FormEvent<ProductFormData>>();
  override formGroup: FormGroup<ProductFormSchema> = this.fb.group({
    name: this.fb.nonNullable.control<string>('', [
      Validators.required,
      Validators.maxLength(100),
      Validators.minLength(3),
    ]),
    shortDescription: this.fb.nonNullable.control<string>('', [
      Validators.required,
      Validators.maxLength(255),
      Validators.minLength(10),
    ]),
    description: this.fb.nonNullable.control<string>('', [Validators.required]),
    categories: this.fb.nonNullable.control<CategorySummary[]>(
      [],
      [Validators.required],
    ),
    brandId: this.fb.nonNullable.control<string>('', [Validators.required]),
    modelYear: this.fb.nonNullable.control<string>('', [Validators.required]),
    attributes: this.fb.nonNullable.control<AttributeSummary[]>(
      [],
      [Validators.required],
    ),
    isActive: this.fb.nonNullable.control<boolean>(true),
    basePrice: this.fb.control<number | null>(0, [
      Validators.required,
      Validators.min(0),
    ]),
    sku: this.fb.nonNullable.control<string>('', [
      Validators.required,
      Validators.maxLength(50),
      Validators.minLength(3),
    ]),
    isFeatured: this.fb.nonNullable.control<boolean>(false),
    tags: this.fb.nonNullable.control<string[]>(
      [],
      [Validators.required, Validators.minLength(1)],
    ),
    weight: this.fb.nonNullable.control<string>('', [
      Validators.required,
      Validators.pattern(/^\d+(\.\d{1,2})?\s?(kg|g|lb|oz)$/i),
    ]),
    dimensions: this.fb.group<ProductDimensionsFormSchema>({
      length: this.fb.nonNullable.control<string>('', [
        Validators.pattern(/^\d+(\.\d{1,2})?\s?(cm|mm|in|ft)$/i),
      ]),
      width: this.fb.nonNullable.control<string>('', [
        Validators.pattern(/^\d+(\.\d{1,2})?\s?(cm|mm|in|ft)$/i),
      ]),
      height: this.fb.nonNullable.control<string>('', [
        Validators.pattern(/^\d+(\.\d{1,2})?\s?(cm|mm|in|ft)$/i),
      ]),
    }),
    metaTitle: this.fb.nonNullable.control<string>('', [
      Validators.required,
      Validators.maxLength(60),
      Validators.minLength(10),
    ]),
    metaDescription: this.fb.nonNullable.control<string>('', [
      Validators.required,
      Validators.maxLength(160),
      Validators.minLength(10),
    ]),
  });

  constructor() {
    super();

    afterNextRender(() => {
      this.formGroup.controls.categories.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((categories) => {
          this.service.selectedCategoriesChange$.next(categories);
        });
    });

    effect((onCleanup) => {
      const formActions = this.formActions();
      if (!formActions) return;

      const clearSub = formActions.clear.subscribe(() => {
        queueMicrotask(() => this.clearCategoryDrivenAttributes());
      });

      onCleanup(() => {
        clearSub.unsubscribe();
      });
    });

    effect(() => {
      this.onAttributesLoadedByCategories(this.categoryDrivenAttributes());
    });
  }

  ngOnInit(): void {
    this.registerHanlerAttributesLoadedByCategories();
    this.registerDisableControlHandler();
  }

  loadMoreCategories() {
    this.service.loadMoreCategories$.next();
  }

  loadMoreBrands() {
    this.service.loadMoreBrands$.next();
  }

  loadMoreAttributes() {
    this.service.loadMoreAttributes$.next();
  }

  onSubmit() {
    this.submit();
    if (this.actions().clearOnSubmit) {
      this.clearCategoryDrivenAttributes();
    }
  }

  private registerHanlerAttributesLoadedByCategories(): void {
    this.service.attributesByCategoriesLoaded$.subscribe({
      next: (attributes) => this.onAttributesLoadedByCategories(attributes),
    });
  }

  private registerDisableControlHandler(): void {
    this.service.disabledControls$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((disabledControls) => {
        Object.entries(disabledControls).forEach(([controlName, disabled]) => {
          const control =
            this.formGroup.controls[controlName as keyof ProductFormData];
          if (!control) {
            return;
          }

          if (disabled) {
            control.disable({ emitEvent: false });
            return;
          }

          control.enable({ emitEvent: false });
        });
      });
  }

  private onAttributesLoadedByCategories(attributes: AttributeSummary[]): void {
    this.attributesRequired.set(attributes);
    this.syncAttributesRequiredValidator(attributes);
    this.removeCategoryDrivenAttributesFromControl(attributes);
    this.formGroup.controls.attributes.updateValueAndValidity();
  }

  private syncAttributesRequiredValidator(
    categoryAttributes: AttributeSummary[],
  ): void {
    const attributesControl = this.formGroup.controls.attributes;

    if (categoryAttributes.length > 0) {
      attributesControl.removeValidators(Validators.required);
      return;
    }

    attributesControl.addValidators(Validators.required);
  }

  private removeCategoryDrivenAttributesFromControl(
    attributes: AttributeSummary[],
  ): void {
    const categoryAttributeIds = new Set(
      attributes.map((attribute) => attribute.id),
    );
    if (categoryAttributeIds.size === 0) {
      return;
    }

    const selectedAttributes = this.formGroup.controls.attributes.value;
    const nextAttributes = selectedAttributes.filter(
      (attribute) => !categoryAttributeIds.has(attribute.id),
    );

    if (nextAttributes.length !== selectedAttributes.length) {
      this.formGroup.controls.attributes.setValue(nextAttributes);
    }
  }

  private clearCategoryDrivenAttributes(): void {
    this.attributesRequired.set([]);
    this.syncAttributesRequiredValidator([]);
    this.formGroup.controls.attributes.setValue([]);
    this.formGroup.controls.attributes.updateValueAndValidity();
    this.service.attributesByCategoriesLoaded$.next([]);
    this.service.selectedCategoriesChange$.next([]);
  }

  onTagsKeyUp(event: KeyboardEvent): void {
    if (this.formGroup.controls.tags.disabled) {
      return;
    }

    if (event.key !== 'Enter') {
      return;
    }
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();
    if (value.length === 0) {
      return;
    }
    const currentTags = this.formGroup.controls.tags.value;
    if (currentTags.includes(value)) {
      input.value = '';
      return;
    }
    this.formGroup.controls.tags.setValue([...currentTags, value]);
    input.value = '';
    this.formGroup.controls.tags.markAsDirty();
    this.formGroup.controls.tags.markAsTouched();
  }

  onTagsBlur(event: FocusEvent): void {
    this.formGroup.controls.tags.markAsTouched();
    console.log('tags blur', this.formGroup.controls.tags.value);
  }

  removeTag(index: number): void {
    if (this.formGroup.controls.tags.disabled) {
      return;
    }

    const currentTags = this.formGroup.controls.tags.value;
    const newTags = currentTags.filter((_, i) => i !== index);
    this.formGroup.controls.tags.setValue(newTags);
    this.formGroup.controls.tags.markAsDirty();
    this.formGroup.controls.tags.markAsTouched();
  }
}

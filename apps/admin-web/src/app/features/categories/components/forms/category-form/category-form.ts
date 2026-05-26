import {
    Component,
    inject,
    input,
    InputSignal,
    output,
    OutputEmitterRef,
    Signal,
    viewChild,
} from '@angular/core';
import { ExtractValue, FormActionsOptions, FormComponent, FormEvent } from '@shared/interfaces';
import { CategoryFormData, CategoryFormSchema } from './types';
import { DEFAULT_CATEGORY_FORM_DATA } from './consts';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormDivider } from '@shared/components/ui/form-divider/form-divider';
import {
    Label,
    FormErrorMessage,
    InputImageUpload,
    InputImageUploadConfig,
    InputText,
    InputTextarea,
    Switch,
} from '@shared/components';
import { FormActions } from '@shared/components/form-actions/form-actions';
import {
    CATEGORY_ALLOWED_IMAGE_TYPES,
    CATEGORY_IMAGE_MAX_DATA_URL_LENGTH,
    CATEGORY_IMAGE_MAX_FILE_SIZE_BYTES,
} from './consts';

@Component({
    selector: 'ecom-category-form',
    imports: [
        ReactiveFormsModule,
        FormDivider,
        Label,
        FormErrorMessage,
        FormActions,
        InputImageUpload,
        InputText,
        InputTextarea,
        Switch,
    ],
    templateUrl: './category-form.html',
    styleUrl: './category-form.css',
})
export class CategoryForm extends FormComponent<CategoryFormSchema> {
    private readonly fb: FormBuilder = inject(FormBuilder);

    protected readonly imageUploadConfig: InputImageUploadConfig = {
        valueType: 'data-url',
        multiple: false,
        allowedTypes: CATEGORY_ALLOWED_IMAGE_TYPES,
        maxFileSizeBytes: CATEGORY_IMAGE_MAX_FILE_SIZE_BYTES,
        maxDataUrlLength: CATEGORY_IMAGE_MAX_DATA_URL_LENGTH,
    };

    override initialData: InputSignal<ExtractValue<CategoryFormSchema>> = input(
        DEFAULT_CATEGORY_FORM_DATA,
    );

    override actions: InputSignal<FormActionsOptions> = input(this.defaultActions);

    override submitted: OutputEmitterRef<FormEvent<CategoryFormData>> =
        output<FormEvent<CategoryFormData>>();

    override canceled: OutputEmitterRef<FormEvent<CategoryFormData>> =
        output<FormEvent<CategoryFormData>>();

    override formActions: Signal<FormActions | undefined> = viewChild(FormActions);

    override formGroup: FormGroup<CategoryFormSchema> = this.fb.group<CategoryFormSchema>({
        name: this.fb.nonNullable.control<string>('', [
            Validators.required,
            Validators.minLength(3),
        ]),
        description: this.fb.nonNullable.control<string>('', [
            Validators.required,
            Validators.minLength(10),
        ]),
        imageUrl: this.fb.nonNullable.control<string[]>([]),
        metaTitle: this.fb.nonNullable.control<string>('', [
            Validators.required,
            Validators.minLength(5),
        ]),
        metaDescription: this.fb.nonNullable.control<string>('', [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(160),
        ]),
        visibleInMenu: this.fb.nonNullable.control<boolean>(true),
        isActive: this.fb.nonNullable.control<boolean>(true),
    });

    constructor() {
        super();
    }

    onSubmit(): void {
        this.submit();
    }
}

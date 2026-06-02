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
import { FormActionsOptions, FormComponent, FormEvent } from '../../../../../shared/interfaces/form.interface';
import { BrandFormData, BrandFormSchema } from './types';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Label } from '../../../../../shared/components/ui/label/label';
import { InputText } from '../../../../../shared/components/ui/input-text/input-text';
import { FormErrorMessage } from '../../../../../shared/components/ui/form-error-message/form-error-message';
import { InputImageUpload } from '../../../../../shared/components/ui/input-image-upload/input-image-upload';
import { InputImageUploadConfig } from '../../../../../shared/components/ui/input-image-upload/input-image-upload.types';
import { InputTextarea } from '../../../../../shared/components/ui/input-textarea/input-textarea';
import { Switch } from '../../../../../shared/components/ui/switch/switch';
import { FormDivider } from '../../../../../shared/components/ui/form-divider/form-divider';
import { FormActions } from '../../../../../shared/components/form-actions/form-actions';
import { urlValidator } from '../../../../../shared/validators/url-validator';
import {
    BRAND_ALLOWED_LOGO_TYPES,
    BRAND_LOGO_MAX_DATA_URL_LENGTH,
    BRAND_LOGO_MAX_FILE_SIZE_BYTES,
    DEFAULT_BRAND_FORM_DATA,
} from './consts';

@Component({
    selector: 'ecom-brand-form',
    imports: [
        ReactiveFormsModule,
        Label,
        InputText,
        FormErrorMessage,
        FormDivider,
        InputImageUpload,
        InputTextarea,
        Switch,
        FormActions,
    ],
    templateUrl: './brand-form.html',
    styleUrl: './brand-form.css',
})
export class BrandForm extends FormComponent<BrandFormSchema> {
    private readonly fb: FormBuilder = inject(FormBuilder);

    protected readonly imageUploadConfig: InputImageUploadConfig = {
        valueType: 'data-url',
        multiple: false,
        allowedTypes: BRAND_ALLOWED_LOGO_TYPES,
        maxFileSizeBytes: BRAND_LOGO_MAX_FILE_SIZE_BYTES,
        maxDataUrlLength: BRAND_LOGO_MAX_DATA_URL_LENGTH,
    };

    override actions: InputSignal<FormActionsOptions> = input(this.defaultActions);

    override formActions: Signal<FormActions | undefined> = viewChild(FormActions);

    override initialData: InputSignal<BrandFormData> = input(DEFAULT_BRAND_FORM_DATA);

    override submitted: OutputEmitterRef<FormEvent<BrandFormData>> =
        output<FormEvent<BrandFormData>>();

    override canceled: OutputEmitterRef<FormEvent<BrandFormData>> =
        output<FormEvent<BrandFormData>>();

    override formGroup: FormGroup<BrandFormSchema> = this.fb.group<BrandFormSchema>({
        name: this.fb.nonNullable.control<string>('', [
            Validators.required,
            Validators.minLength(3),
        ]),
        logoUrl: this.fb.nonNullable.control<string[]>([], [Validators.required]),
        description: this.fb.nonNullable.control<string>('', [
            Validators.required,
            Validators.minLength(10),
        ]),
        metaTitle: this.fb.nonNullable.control<string>('', [
            Validators.required,
            Validators.minLength(5),
        ]),
        metaDescription: this.fb.nonNullable.control<string>('', [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(160),
        ]),
        website: this.fb.nonNullable.control<string>('', [Validators.required, urlValidator]),
        visibleInMenu: this.fb.nonNullable.control<boolean>(true),
        isActive: this.fb.nonNullable.control<boolean>(true),
    });

    onSubmit(): void {
        this.submit();
        if (this.actions().clearOnSubmit) {
            this.formGroup.reset(DEFAULT_BRAND_FORM_DATA);
        }
    }
}

import { FormControl } from '@angular/forms';
import { ExtractValue, FormSchema } from '../../../../../shared/interfaces/form.interface';

export interface BrandFormSchema extends FormSchema {
    name: FormControl<string>;
    logoUrl: FormControl<string[]>;
    description: FormControl<string>;
    metaTitle: FormControl<string>;
    metaDescription: FormControl<string>;
    website: FormControl<string>;
    visibleInMenu: FormControl<boolean>;
    isActive: FormControl<boolean>;
}

export type BrandFormData = ExtractValue<BrandFormSchema>;


import { FormControl } from '@angular/forms';
import { ExtractValue, FormSchema } from '../../../../../shared/interfaces/form.interface';

export interface CategoryFormSchema extends FormSchema {
    name: FormControl<string>;
    description: FormControl<string>;
    imageUrl: FormControl<string[]>;
    metaTitle: FormControl<string>;
    metaDescription: FormControl<string>;
    visibleInMenu: FormControl<boolean>;
    isActive: FormControl<boolean>;
}

export type CategoryFormData = ExtractValue<CategoryFormSchema>;

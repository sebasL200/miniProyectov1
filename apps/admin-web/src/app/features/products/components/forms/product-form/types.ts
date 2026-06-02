import { FormControl, FormGroup } from '@angular/forms';
import { InputSelectOption } from '../../../../../shared/components';
import { ExtractValue, FormSchema } from '../../../../../shared/interfaces';
import { AttributeSummary, Brand, CategorySummary } from '../../../../../shared/models';

export interface ProductDimensionsFormSchema extends FormSchema {
    length: FormControl<string>;
    width: FormControl<string>;
    height: FormControl<string>;
}

export interface ProductFormSchema extends FormSchema {
    name: FormControl<string>;
    shortDescription: FormControl<string>;
    description: FormControl<string>;
    categories: FormControl<CategorySummary[]>;
    brandId: FormControl<string>;
    modelYear: FormControl<string>;
    attributes: FormControl<AttributeSummary[]>;
    isActive: FormControl<boolean>;
    basePrice: FormControl<number | null>;
    sku: FormControl<string>;
    isFeatured: FormControl<boolean>;
    tags: FormControl<string[]>;
    weight: FormControl<string>;
    dimensions: FormGroup<ProductDimensionsFormSchema>;
    metaTitle: FormControl<string>;
    metaDescription: FormControl<string>;
}

export type ProductFormData = ExtractValue<ProductFormSchema>;


export type ProductCategoryOption = InputSelectOption<CategorySummary>;
export type ProductBrandOption = InputSelectOption<Brand['id']>;
export type ProductAttributeOption = InputSelectOption<AttributeSummary>;

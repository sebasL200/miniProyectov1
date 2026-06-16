import { FormControl, FormGroup } from '@angular/forms';
import { AttributeProductVariantSummary } from '@product-variants/types/attribute.type';
import { InputSelectOption } from '@shared/components/ui/input-select/input-select.types';
import { ExtractValue, FormSchema } from '@shared/interfaces';
import { ProductSummary } from '@shared/models';

export interface ProductVariantAttributeValueFormData {
  attribute: AttributeProductVariantSummary;
  value: string;
}

export interface ProductVariantDimensionsFormSchema extends FormSchema {
  width: FormControl<string>;
  height: FormControl<string>;
  length: FormControl<string>;
  weight: FormControl<string>;
}

export interface ProductVariantFormSchema extends FormSchema {
  product: FormControl<ProductSummary | null>;
  name: FormControl<string>;
  sku: FormControl<string>;
  price: FormControl<number | null>;
  minimumStock: FormControl<string>;
  barcode: FormControl<string>;
  description: FormControl<string>;
  isActive: FormControl<boolean>;
  images: FormControl<string[]>;
  dimensions: FormGroup<ProductVariantDimensionsFormSchema>;
  attributes: FormControl<AttributeProductVariantSummary[]>;
  attributeValues: FormControl<ProductVariantAttributeValueFormData[]>;
}

export type ProductVariantFormData = ExtractValue<ProductVariantFormSchema>;
export type ProductVariantFormControlName = keyof ProductVariantFormSchema;

export type ProductVariantProductOption = InputSelectOption<ProductSummary>;
export type ProductVariantAttributeOption =
  InputSelectOption<AttributeProductVariantSummary>;

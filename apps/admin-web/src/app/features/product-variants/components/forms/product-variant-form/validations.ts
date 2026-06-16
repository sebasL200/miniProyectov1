import {
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { ProductVariantAttributeValueFormData } from './types';

export const PRODUCT_VARIANT_SKU_PATTERN = /^[A-Za-z0-9-]{5,32}$/;
export const PRODUCT_VARIANT_WEIGHT_PATTERN =
  /^\d+(\.\d{1,2})?\s?(kg|g|lb|oz)$/i;
export const PRODUCT_VARIANT_MEASURE_PATTERN =
  /^\d+(\.\d{1,2})?\s?(cm|mm|in|ft)$/i;

export function productVariantSkuValidator(): ValidatorFn {
  return Validators.pattern(PRODUCT_VARIANT_SKU_PATTERN);
}

export function productVariantBarcodeGtinValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value;

    if (!value) {
      return null;
    }

    if (!/^\d+$/.test(value)) {
      return { barcodeGtinDigits: true };
    }

    if (![8, 12, 13, 14].includes(value.length)) {
      return { barcodeGtinLength: true };
    }

    if (!hasValidGtinCheckDigit(value)) {
      return { barcodeGtinCheckDigit: true };
    }

    return null;
  };
}

export function productVariantEffectiveAttributeValuesValidator(): ValidatorFn {
  return (
    control: AbstractControl<ProductVariantAttributeValueFormData[]>,
  ): ValidationErrors | null => {
    const values = control.value ?? [];
    const hasMissingValue = values.some((item) => item.value.trim() === '');

    return hasMissingValue ? { effectiveAttributeValues: true } : null;
  };
}

export function productVariantWeightValidator(): ValidatorFn {
  return Validators.pattern(PRODUCT_VARIANT_WEIGHT_PATTERN);
}

export function productVariantMeasureValidator(): ValidatorFn {
  return Validators.pattern(PRODUCT_VARIANT_MEASURE_PATTERN);
}

export function productVariantNonNegativeIntegerValidator(): ValidatorFn {
  return (control: AbstractControl<string>): ValidationErrors | null => {
    const value = control.value;

    if (value === '') {
      return null;
    }

    return /^(0|[1-9]\d*)$/.test(value) ? null : { nonNegativeInteger: true };
  };
}

function hasValidGtinCheckDigit(value: string): boolean {
  let sum = 0;
  let weight = 3;

  for (let index = value.length - 2; index >= 0; index -= 1) {
    sum += Number(value[index]) * weight;
    weight = weight === 3 ? 1 : 3;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === Number(value[value.length - 1]);
}

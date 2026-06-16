import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  signal,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import { FormValueControl } from '@angular/forms/signals';
import { InputText } from '@shared/components';
import { buildFormValueControlProvider } from '@shared/utils/form-value-control-provider.builder';
import {
  ProductVariantAttributeTableRow,
  ProductVariantAttributeValue,
} from './types';
import { AttributeProductVariantSummary } from '@product-variants/types/attribute.type';

@Component({
  selector: 'ecom-product-variant-attributes-table',
  imports: [InputText],
  templateUrl: './product-variant-attributes-table.html',
  styleUrl: './product-variant-attributes-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [buildFormValueControlProvider(ProductVariantAttributesTable)],
})
export class ProductVariantAttributesTable
  implements
    FormValueControl<ProductVariantAttributeValue[]>,
    ControlValueAccessor
{
  readonly attributes = input<AttributeProductVariantSummary[]>([]);
  readonly directAttributes = input<AttributeProductVariantSummary[]>([]);
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly value = model<ProductVariantAttributeValue[]>([]);

  private readonly cvaDisabled = signal(false);
  private onChange: (value: ProductVariantAttributeValue[]) => void = () => {};
  private onTouched: () => void = () => {};
  protected readonly isDisabled = computed(
    () => this.disabled() || this.cvaDisabled(),
  );
  protected readonly rows = computed<ProductVariantAttributeTableRow[]>(() => {
    const valueByAttributeId = new Map(
      this.value().map((item) => [item.attribute.id, item.value]),
    );

    return this.attributes().map((attribute, index) => ({
      attribute,
      order: index,
      value: valueByAttributeId.get(attribute.id) ?? '',
    }));
  });

  writeValue(value: ProductVariantAttributeValue[] | null): void {
    this.value.set(value ?? []);
  }

  registerOnChange(fn: (value: ProductVariantAttributeValue[]) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  protected trackRow(row: ProductVariantAttributeTableRow): string {
    return row.attribute.id;
  }

  protected onValueChange(
    row: ProductVariantAttributeTableRow,
    value: string,
  ): void {
    const rows = this.rows().map((item) =>
      item.attribute.id === row.attribute.id ? { ...item, value } : item,
    );
    this.commitRows(rows);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  private commitRows(rows: ProductVariantAttributeTableRow[]): void {
    const nextValue = rows.map((row) => ({
      attribute: row.attribute,
      value: row.value,
    }));

    this.value.set(nextValue);
    this.onChange(nextValue);
    this.onTouched();
  }
}

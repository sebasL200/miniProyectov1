import { DataGridColumn } from '@shared/components/ui/data-grid/data-grid.types';

export const PRODUCT_VARIANT_PRODUCT_COLUMN: DataGridColumn = {
  field: 'product.name',
  label: 'Producto',
  template: 'product',
};

export const PRODUCT_VARIANT_PRICE_COLUMN: DataGridColumn = {
  field: 'price',
  label: 'Precio',
  template: 'price',
};

export const PRODUCT_VARIANT_WEIGHT_COLUMN: DataGridColumn = {
  field: 'dimensions.weight',
  label: 'Peso',
  template: 'weight',
};

export const PRODUCT_VARIANT_ACTIONS_COLUMN: DataGridColumn = {
  field: 'actions',
  label: 'Acciones',
  template: 'actions',
};

export const PRODUCT_VARIANTS_BASE_COLUMNS: DataGridColumn[] = [
  PRODUCT_VARIANT_PRODUCT_COLUMN,
  PRODUCT_VARIANT_PRICE_COLUMN,
  PRODUCT_VARIANT_WEIGHT_COLUMN,
  PRODUCT_VARIANT_ACTIONS_COLUMN,
];

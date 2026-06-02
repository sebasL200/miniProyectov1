import { DataGridColumn } from '../../../shared/components/ui/data-grid/data-grid.types';

export const PRODUCT_NAME_COLUMN: DataGridColumn = {
    label: 'Nombre',
    field: 'name',
    template: 'name',
};

export const PRODUCT_BRAND_COLUMN: DataGridColumn = {
    label: 'Marca',
    field: 'brand.name',
};

export const PRODUCT_MODEL_COLUMN: DataGridColumn = {
    label: 'Modelo',
    field: 'modelYear',
    template: 'modelYear',
};

export const PRODUCT_BASE_PRICE_COLUMN: DataGridColumn = {
    label: 'Precio Base',
    field: 'basePrice',
    template: 'basePrice',
};

export const PRODUCT_FEATURED_COLUMN: DataGridColumn = {
    label: 'Destacado',
    field: 'isFeatured',
    template: 'featured',
};

export const PRODUCT_ACTIVE_COLUMN: DataGridColumn = {
    label: 'Activo',
    field: 'isActive',
    template: 'active',
};

export const PRODUCT_ACTIONS_COLUMN: DataGridColumn = {
    label: 'Acciones',
    field: 'actions',
    template: 'actions',
};

import { DataGridColumn } from '../../../shared/components/ui/data-grid/data-grid.types';

export const BRAND_LOGO_COLUMN: DataGridColumn = {
    field: 'logoUrl',
    label: 'Logo',
    template: 'logo',
};

export const BRAND_NAME_COLUMN: DataGridColumn = {
    field: 'name',
    label: 'Nombre',
    template: 'name',
};

export const BRAND_DESCRIPTION_COLUMN: DataGridColumn = {
    field: 'description',
    label: 'Descripción',
    template: 'description',
};

export const BRAND_SLUG_COLUMN: DataGridColumn = {
    field: 'slug',
    label: 'Slug',
    template: 'slug',
};

export const BRAND_WEBSITE_COLUMN: DataGridColumn = {
    field: 'website',
    label: 'Sitio web',
    template: 'website',
};

export const BRAND_META_TITLE_COLUMN: DataGridColumn = {
    field: 'metaTitle',
    label: 'Meta título',
    template: 'meta_title',
};

export const BRAND_META_DESCRIPTION_COLUMN: DataGridColumn = {
    field: 'metaDescription',
    label: 'Meta descripción',
    template: 'meta_description',
};

export const BRAND_VISIBLE_IN_MENU_COLUMN: DataGridColumn = {
    field: 'visibleInMenu',
    label: 'Visible en menú',
    template: 'visible_in_menu',
};

export const BRAND_STATUS_COLUMN: DataGridColumn = {
    field: 'isActive',
    label: 'Estado',
    template: 'status',
};

export const BRAND_ACTIONS_COLUMN: DataGridColumn = {
    field: 'actions',
    label: 'Acciones',
    template: 'actions',
};

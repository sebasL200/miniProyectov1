import { DataGridColumn } from '../../../shared/components/ui/data-grid/data-grid.types';

export const NAME_COLUMN: DataGridColumn = {
    field: 'name',
    label: 'Nombre',
};

export const DESCRIPTION_COLUMN: DataGridColumn = {
    field: 'description',
    label: 'Descripción',
};

export const SLUG_COLUMN: DataGridColumn = {
    field: 'slug',
    label: 'Slug',
};

export const PARENT_COLUMN: DataGridColumn = {
    field: 'parent.name',
    label: 'Categoría Padre',
};

export const META_TITLE_COLUMN: DataGridColumn = {
    field: 'metaTitle',
    label: 'Título Meta',
};

export const META_DESCRIPTION_COLUMN: DataGridColumn = {
    field: 'metaDescription',
    label: 'Descripción Meta',
};

export const VISIBLE_IN_MENU_COLUMN: DataGridColumn = {
    field: 'visibleInMenu',
    label: 'Visibilidad en el Menú',
    template: 'showMenu',
};

export const STATUS_COLUMN: DataGridColumn = {
    field: 'isActive',
    label: 'Estado',
    template: 'status',
};

export const ACTIONS_COLUMN: DataGridColumn = {
    label: 'Acciones',
    template: 'actions',
};



export const SUBCATEGORIES_COLUMNS: DataGridColumn[] = [
    NAME_COLUMN,
    PARENT_COLUMN,
    SLUG_COLUMN,
    VISIBLE_IN_MENU_COLUMN,
    STATUS_COLUMN,
    ACTIONS_COLUMN,
];

export const PARENT_CATEGORIES_COLUMNS: DataGridColumn[] = [
    NAME_COLUMN,
    DESCRIPTION_COLUMN,
    META_DESCRIPTION_COLUMN,
    VISIBLE_IN_MENU_COLUMN,
    STATUS_COLUMN,
    ACTIONS_COLUMN,
];

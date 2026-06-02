import { BRAND_LOGO_COLUMN, BRAND_NAME_COLUMN, BRAND_WEBSITE_COLUMN, BRAND_VISIBLE_IN_MENU_COLUMN, BRAND_STATUS_COLUMN, BRAND_ACTIONS_COLUMN } from '../../consts/brand-columns.consts';
import { DataGridColumn } from '../../../../shared/components/ui/data-grid/data-grid.types';

export const BRANDS_TABLE_BASE_COLUMNS: DataGridColumn[] = [
    BRAND_LOGO_COLUMN,
    BRAND_NAME_COLUMN,
    BRAND_WEBSITE_COLUMN,
    BRAND_VISIBLE_IN_MENU_COLUMN,
    BRAND_STATUS_COLUMN,
    BRAND_ACTIONS_COLUMN
];

import { BRAND_DESCRIPTION_COLUMN, BRAND_LOGO_COLUMN, BRAND_NAME_COLUMN, BRAND_STATUS_COLUMN, BRAND_VISIBLE_IN_MENU_COLUMN, BRAND_WEBSITE_COLUMN } from '../../consts/brand-columns.consts';
import { DataGridColumn } from '../../../../shared/components/ui/data-grid/data-grid.types';

export const BRAND_DRAFTS_COLUMNS: DataGridColumn[] = [
    BRAND_LOGO_COLUMN,
    BRAND_NAME_COLUMN,
    BRAND_DESCRIPTION_COLUMN,
    BRAND_WEBSITE_COLUMN,
    BRAND_VISIBLE_IN_MENU_COLUMN,
    BRAND_STATUS_COLUMN,
];

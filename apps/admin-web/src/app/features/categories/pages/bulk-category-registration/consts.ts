import { ACTIONS_COLUMN, NAME_COLUMN, STATUS_COLUMN, VISIBLE_IN_MENU_COLUMN } from '../../consts/categories-columns.consts';
import { DataGridColumn } from '../../../../shared/components/ui/data-grid/data-grid.types';

export const BULK_CATEGORY_REGISTRATION_COLUMNS: DataGridColumn[] = [
    NAME_COLUMN,
    VISIBLE_IN_MENU_COLUMN,
    STATUS_COLUMN,
    ACTIONS_COLUMN,
];

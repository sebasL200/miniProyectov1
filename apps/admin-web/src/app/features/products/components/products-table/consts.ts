import { PRODUCT_ACTIONS_COLUMN, PRODUCT_ACTIVE_COLUMN, PRODUCT_BASE_PRICE_COLUMN, PRODUCT_FEATURED_COLUMN, PRODUCT_MODEL_COLUMN, PRODUCT_NAME_COLUMN } from "../../consts/product-columns.consts";
import { DataGridColumn } from "../../../../shared/components/ui/data-grid/data-grid.types";

export const PRODUCTS_TABLE_BASE_COLUMNS: DataGridColumn[] = [
    PRODUCT_NAME_COLUMN,
    //TODO: Add brand column when the API returns the brand name instead of the ID
    //PRODUCT_BRAND_COLUMN,
    PRODUCT_MODEL_COLUMN,
    PRODUCT_BASE_PRICE_COLUMN,
    PRODUCT_FEATURED_COLUMN,
    PRODUCT_ACTIVE_COLUMN,
    PRODUCT_ACTIONS_COLUMN,
];

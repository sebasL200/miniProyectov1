import { OffsetPaginatedResponse } from "../../../../shared/interfaces";
import { Product } from "../../../../shared/models";

export type ProductsCompositeResponse = OffsetPaginatedResponse<'products', Product>;

export type OffsetProductsResponse = OffsetPaginatedResponse<'products', Product>;

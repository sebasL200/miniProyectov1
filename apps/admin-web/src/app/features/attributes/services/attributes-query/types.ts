/**
 * Stub types – Attributes feature frozen for incremental delivery.
 * These will be replaced with real implementations when AttributesModule is unfrozen.
 */

import { ApiResponse } from '../../../../shared/interfaces';
import { Attribute } from '../../../../shared/models';

export interface AttributesListPayload {
  attributes: Attribute[];
  nextCursor?: string | null;
  prevCursor?: string | null;
  total?: number;
}

export type AttributesCursorResponse = ApiResponse<AttributesListPayload>;
export type AttributesNonPaginatedResponse = ApiResponse<AttributesListPayload>;
export type AttributesResponse =
  | AttributesCursorResponse
  | AttributesNonPaginatedResponse;

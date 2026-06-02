/**
 * Stub AttributesQueryService – Attributes feature frozen for incremental delivery.
 * All methods return NEVER-resolving observables so they don't accidentally trigger HTTP calls.
 * Replace with the real implementation when AttributesModule is unfrozen.
 */

import { Injectable } from '@angular/core';
import { NEVER, Observable } from 'rxjs';
import { SearchParams } from '../../../../shared/interfaces';
import { AttributesResponse } from './types';

export interface AttributeQueryFilters {
  appliesToAll?: boolean;
  categoryIds?: string;
  or?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AttributesQueryService {
   
  getAttributes(
    _params: SearchParams,
    _filters?: AttributeQueryFilters,
  ): Observable<AttributesResponse> {
    // frozen – entrega incremental
    return NEVER as unknown as Observable<AttributesResponse>;
  }

   
  getAttributesCursorByCategoryIds(
    _categoryIds: string[],
    _params: SearchParams,
  ): Observable<AttributesResponse> {
    // frozen – entrega incremental
    return NEVER as unknown as Observable<AttributesResponse>;
  }
}

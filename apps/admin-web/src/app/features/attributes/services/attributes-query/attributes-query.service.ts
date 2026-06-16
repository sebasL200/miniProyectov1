import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { SearchParams } from '../../../../shared/interfaces';
import { cleanParams } from '../../../../shared/utils/params.utils';
import { AttributesResponse } from './types';

export interface AttributeQueryFilters {
  appliesToAll?: boolean;
  categoryIds?: string;
  or?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AttributesQueryService {
  private readonly http: HttpClient = inject(HttpClient);

  getAttributes(
    params: SearchParams,
    filters?: AttributeQueryFilters,
  ): Observable<AttributesResponse> {
    return this.http.get<AttributesResponse>(
      `${environment.apiUrl}/attributes`,
      {
        params: cleanParams({ ...params, ...filters }),
      },
    );
  }

  getAttributesCursorByCategoryIds(
    categoryIds: string[],
    params: SearchParams,
  ): Observable<AttributesResponse> {
    return this.http.get<AttributesResponse>(
      `${environment.apiUrl}/attributes`,
      {
        params: cleanParams({
          ...params,
          categoryIds: categoryIds.join(','),
          or: 'appliesToAll,categoryIds',
          appliesToAll: true,
        }),
      },
    );
  }
}

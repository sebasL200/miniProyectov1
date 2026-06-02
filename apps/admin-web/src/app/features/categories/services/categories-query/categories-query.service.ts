import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CategoriesOffsetResponse } from '../../pages/categories/types';
import { CursorPaginationParams, OffsetPaginationParams } from '../../../../shared/interfaces/api.interface';
import { environment } from '../../../../../environments/environment';
import { CategoriesCursorResponse } from './types';
import { cleanParams } from '../../../../shared/utils/params.utils';

@Injectable({
    providedIn: 'root',
})
export class CategoriesQueryService {
    private readonly http: HttpClient = inject(HttpClient);

    getCategoriesOffset(
        offsetParams: OffsetPaginationParams,
    ): Observable<CategoriesOffsetResponse> {
        return this.http.get<CategoriesOffsetResponse>(`${environment.apiUrl}/categories`, {
            params: cleanParams(offsetParams),
        });
    }

    getCategoriesCursor(
        cursorParams: CursorPaginationParams,
    ): Observable<CategoriesCursorResponse> {
        return this.http.get<CategoriesCursorResponse>(`${environment.apiUrl}/categories`, {
            params: cleanParams(cursorParams),
        });
    }
}

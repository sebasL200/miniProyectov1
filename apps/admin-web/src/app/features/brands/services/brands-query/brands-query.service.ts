import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CursorPaginationParams, OffsetPaginationParams } from '../../../../shared/interfaces/api.interface';
import { cleanParams } from '../../../../shared/utils/params.utils';
import { Observable } from 'rxjs';
import { BrandsCursorResponse, BrandsOffsetResponse } from './types';

@Injectable({
    providedIn: 'root',
})
export class BrandsQueryService {
    private readonly http: HttpClient = inject(HttpClient);

    getBrandsOffset(offsetParams: OffsetPaginationParams): Observable<BrandsOffsetResponse> {
        return this.http.get<BrandsOffsetResponse>(`${environment.apiUrl}/brands`, {
            params: cleanParams(offsetParams),
        });
    }

    getBrandsCursor(cursorParams: CursorPaginationParams): Observable<BrandsCursorResponse> {
        return this.http.get<BrandsCursorResponse>(`${environment.apiUrl}/brands`, {
            params: cleanParams(cursorParams),
        });
    }
}

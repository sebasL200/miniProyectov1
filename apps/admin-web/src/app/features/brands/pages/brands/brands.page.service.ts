import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { OffsetPaginationParams } from '../../../../shared/interfaces';
import { Observable } from 'rxjs';

import { BrandsOffsetResponse } from './types';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class BrandsPageService {
    paginationParams = signal<OffsetPaginationParams>({
        page: 1,
        pageSize: 5,
        paginationType: 'offset',
        query: '',
    });

    updatePage(newPage: number): void {
        this.paginationParams.update((params) => ({ ...params, page: newPage }));
    }

    private readonly http: HttpClient = inject(HttpClient);

    getCompositeBrandsPage(): Observable<BrandsOffsetResponse> {
        return this.http.get<BrandsOffsetResponse>(`${environment.apiUrl}/brands`, {
            params: {
                page: this.paginationParams().page.toString(),
                pageSize: this.paginationParams().pageSize.toString(),
            },
        });
    }

    fetchBrands(): Observable<BrandsOffsetResponse> {
        return this.http.get<BrandsOffsetResponse>(`${environment.apiUrl}/brands`, {
            params: {
                page: this.paginationParams().page.toString(),
                pageSize: this.paginationParams().pageSize.toString(),
            },
        });
    }
}

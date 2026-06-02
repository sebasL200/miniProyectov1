import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { OffsetProductsResponse, ProductsCompositeResponse } from './types';
import { OffsetPaginationParams } from '../../../../shared/interfaces/api.interface';
import { environment } from '../../../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ProductsPageService {
    private readonly http: HttpClient = inject(HttpClient);

    paginationParams = signal<OffsetPaginationParams>({
        page: 1,
        pageSize: 5,
        paginationType: 'offset',
        query: '',
    });

    getProductsPageComposite(): Observable<ProductsCompositeResponse> {
        return this.http.get<ProductsCompositeResponse>(`${environment.apiUrl}/products`, {
            params: {
                page: this.paginationParams().page.toString(),
                pageSize: this.paginationParams().pageSize.toString(),
                paginationType: this.paginationParams().paginationType,
            },
        });
    }

    fetchProducts(): Observable<OffsetProductsResponse> {
        return this.http.get<OffsetProductsResponse>(`${environment.apiUrl}/products`, {
            params: {
                page: this.paginationParams().page.toString(),
                pageSize: this.paginationParams().pageSize.toString(),
                paginationType: this.paginationParams().paginationType,
            },
        });
    }
}

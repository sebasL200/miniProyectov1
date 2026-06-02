import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { Product } from '../../../../shared/models/product.model';
import { Observable } from 'rxjs';
import { GetProductByIdResponse } from './types';

@Injectable({
    providedIn: 'root',
})
export class ProductService {
    private readonly http = inject(HttpClient);

    getProductById<TProduct = Product>(
        id: string,
    ): Observable<GetProductByIdResponse<TProduct>> {
        return this.http.get<GetProductByIdResponse<TProduct>>(
            `${environment.apiUrl}/products/${id}`,
        );
    }
}

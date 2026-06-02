import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { CursorPaginationParams, OffsetPaginationParams } from '../../../../shared/interfaces/api.interface';
import { Product } from '../../../../shared/models/product.model';
import { cleanParams } from '../../../../shared/utils/params.utils';
import { Observable } from 'rxjs';
import { ProductsCursorResponse, ProductsOffsetResponse } from './types';

@Injectable({
  providedIn: 'root',
})
export class ProductsQueryService {
  private readonly http = inject(HttpClient);

  getProductsOffset<TProduct = Product>(
    offsetParams: OffsetPaginationParams,
  ): Observable<ProductsOffsetResponse<TProduct>> {
    return this.http.get<ProductsOffsetResponse<TProduct>>(
      `${environment.apiUrl}/products`,
      {
        params: cleanParams(offsetParams),
      },
    );
  }

  getProductsCursor<TProduct = Product>(
    cursorParams: CursorPaginationParams,
  ): Observable<ProductsCursorResponse<TProduct>> {
    return this.http.get<ProductsCursorResponse<TProduct>>(
      `${environment.apiUrl}/products`,
      {
        params: cleanParams(cursorParams),
      },
    );
  }
}

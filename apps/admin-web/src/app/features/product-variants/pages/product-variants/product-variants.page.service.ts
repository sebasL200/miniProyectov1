import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '@environments/environment';
import { OffsetPaginationParams } from '@shared/interfaces';
import { map, Observable } from 'rxjs';
import {
  ApiProductVariant,
  toProductVariant,
} from '../../mappers/product-variant.mapper';
import { ProductVariantsOffsetResponse } from './types';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantsPageService {
  private readonly http = inject(HttpClient);

  readonly paginationParams = signal<OffsetPaginationParams>({
    page: 1,
    pageSize: 5,
    paginationType: 'offset',
    query: '',
  });

  fetchVariants(productId?: string | null): Observable<ProductVariantsOffsetResponse> {
    const params = this.paginationParams();

    return this.http
      .get<ProductVariantsOffsetResponse>(`${environment.apiUrl}/variants`, {
        params: {
          paginationType: params.paginationType,
          page: params.page.toString(),
          pageSize: params.pageSize.toString(),
          ...(productId ? { productId } : {}),
        },
      })
      .pipe(
        map((response) => ({
          ...response,
          data: {
            ...response.data,
            variants: (response.data.variants as unknown as ApiProductVariant[]).map(
              toProductVariant,
            ),
          },
        })),
      );
  }
}

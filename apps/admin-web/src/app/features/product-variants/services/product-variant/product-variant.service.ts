import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { ApiProductVariant, toProductVariant } from '@product-variants/mappers/product-variant.mapper';
import { ApiResponse } from '@shared/interfaces';
import { ProductVariant } from '@shared/models';
import { map, Observable } from 'rxjs';

export type ProductVariantResponse = ApiResponse<{
  variant: ProductVariant;
}>;

@Injectable({
  providedIn: 'root',
})
export class ProductVariantService {
  private readonly http = inject(HttpClient);

  getProductVariantById(id: string): Observable<ProductVariantResponse> {
    return this.http
      .get<ApiResponse<{ variant: ApiProductVariant }>>(
        `${environment.apiUrl}/variants/${id}`,
      )
      .pipe(
        map((response) => ({
          ...response,
          data: {
            ...response.data,
            variant: toProductVariant(response.data.variant),
          },
        })),
      );
  }
}

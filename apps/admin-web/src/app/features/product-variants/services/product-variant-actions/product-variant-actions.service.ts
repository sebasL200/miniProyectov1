import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';
import {
  CreateProductVariant,
  ProductVariantCreated,
  ProductVariantDeleted,
  ProductVariantUpdated,
  UpdateProductVariant,
} from './types';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantActionsService {
  private readonly http = inject(HttpClient);

  createProductVariant(
    payload: CreateProductVariant,
  ): Observable<ProductVariantCreated> {
    return this.http.post<ProductVariantCreated>(
      `${environment.apiUrl}/variants`,
      payload,
    );
  }

  updateProductVariant(
    id: string,
    payload: UpdateProductVariant,
  ): Observable<ProductVariantUpdated> {
    return this.http.patch<ProductVariantUpdated>(
      `${environment.apiUrl}/variants/${id}`,
      payload,
    );
  }

  deleteProductVariant(id: string): Observable<ProductVariantDeleted> {
    return this.http.delete<ProductVariantDeleted>(
      `${environment.apiUrl}/variants/${id}`,
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import {
    ToggleProductActiveStatus,
    ToggleProductFeaturedStatus,
    ProductDeleted,
    ProductUpdated,
    UpdateProduct,
} from './types';
import { Product } from '../../../../shared/models/product.model';

@Injectable({
    providedIn: 'root',
})
export class ProductActionsService {
    private readonly http = inject(HttpClient);

    toggleProductActiveStatus(data: ToggleProductActiveStatus) {
        return this.http.patch<ProductUpdated>(
            `${environment.apiUrl}/products/${data.id}`,
            {
                isActive: data.isActive,
            },
        );
    }

    toggleProductFeaturedStatus(data: ToggleProductFeaturedStatus) {
        return this.http.patch<ProductUpdated>(
            `${environment.apiUrl}/products/${data.id}`,
            {
                isFeatured: data.isFeatured,
            },
        );
    }

    deleteProduct(id: string) {
        return this.http.delete<ProductDeleted>(`${environment.apiUrl}/products/${id}`);
    }

    updateProduct(id: Product['id'], payload: UpdateProduct) {
        return this.http.patch<ProductUpdated>(`${environment.apiUrl}/products/${id}`, payload);
    }
}

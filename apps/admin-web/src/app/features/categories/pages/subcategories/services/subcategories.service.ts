import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    BulkSyncCategoryChildrenRequest,
    SubcategoriesCompositeResponse,
    SyncCategoryChildrenResponse,
} from '../types';
import { Observable } from 'rxjs';
import { environment } from '../../../../../../environments/environment';

@Injectable()
export class SubcategoriesService {
    private readonly http: HttpClient = inject(HttpClient);

    getSubcategoriesComposite(categoryId: string): Observable<SubcategoriesCompositeResponse> {
        return this.http.get<SubcategoriesCompositeResponse>(
            `${environment.apiUrl}/composite/categories/${categoryId}/children`,
        );
    }

    syncCategories(
        parentCategoryId: string,
        request: BulkSyncCategoryChildrenRequest,
    ): Observable<SyncCategoryChildrenResponse> {
        return this.http.patch<SyncCategoryChildrenResponse>(
            `${environment.apiUrl}/categories/${parentCategoryId}/children/sync`,
            request,
        );
    }
}

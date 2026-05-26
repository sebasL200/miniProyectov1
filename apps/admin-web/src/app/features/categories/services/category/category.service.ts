import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    BulkSaveCategoryItem,
    CategoryBatchSavedResponse,
    CategorySavedResponse,
    GetCategoryByIdResponse,
    SaveCategoryRequest,
} from './types';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CategoryService {
    private readonly http: HttpClient = inject(HttpClient);

    getCategoryById(id: string): Observable<GetCategoryByIdResponse> {
        return this.http.get<GetCategoryByIdResponse>(`${environment.apiUrl}/categories/${id}`);
    }

    saveCategory(request: SaveCategoryRequest): Observable<CategorySavedResponse> {
        return this.http.post<CategorySavedResponse>(`${environment.apiUrl}/categories`, request);
    }

    saveBatchCategories(
        categories: BulkSaveCategoryItem[],
    ): Observable<CategoryBatchSavedResponse> {
        return this.http.post<CategoryBatchSavedResponse>(
            `${environment.apiUrl}/categories/batch`,
            {
                categories: categories,
            },
        );
    }
}

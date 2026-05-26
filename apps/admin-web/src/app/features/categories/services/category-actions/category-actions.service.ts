import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
    CategoryDeleted,
    CategoryUpdated,
    ToggleCategoryActiveStatus,
    ToggleCategoryVisibilityInMenu,
    UpdateCategory,
} from './types';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Category } from '@shared/models';

@Injectable({
    providedIn: 'root',
})
export class CategoryActionsService {
    private readonly http: HttpClient = inject(HttpClient);

    toggleCategoryVisibilityInMenu(
        data: ToggleCategoryVisibilityInMenu,
    ): Observable<CategoryUpdated> {
        return this.http.patch<CategoryUpdated>(`${environment.apiUrl}/categories/${data.id}`, {
            visibleInMenu: data.visibleInMenu,
        });
    }

    toggleCategoryActiveStatus(data: ToggleCategoryActiveStatus): Observable<CategoryUpdated> {
        return this.http.patch<CategoryUpdated>(`${environment.apiUrl}/categories/${data.id}`, {
            isActive: data.isActive,
        });
    }

    deleteCategory(id: string): Observable<CategoryDeleted> {
        return this.http.delete<CategoryDeleted>(`${environment.apiUrl}/categories/${id}`);
    }

    updateCategory(id: Category['id'], payload: UpdateCategory): Observable<CategoryUpdated> {
        return this.http.patch<CategoryUpdated>(`${environment.apiUrl}/categories/${id}`, payload);
    };
}

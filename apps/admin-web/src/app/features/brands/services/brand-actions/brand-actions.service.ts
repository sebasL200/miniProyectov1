import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BrandDeleted, BrandUpdated, ToggleBrandActiveStatus, ToggleBrandVisibilityInMenu, UpdateBrand } from './types';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { Brand } from '../../../../shared/models/brand.model';

@Injectable({
    providedIn: 'root',
})
export class BrandActionsService {
    private readonly http: HttpClient = inject(HttpClient);

    toggleBrandVisibilityInMenu(data: ToggleBrandVisibilityInMenu): Observable<BrandUpdated> {
        return this.http.patch<BrandUpdated>(`${environment.apiUrl}/brands/${data.id}`, {
            visibleInMenu: data.visibleInMenu,
        });
    }

    toggleBrandActiveStatus(data: ToggleBrandActiveStatus): Observable<BrandUpdated> {
        return this.http.patch<BrandUpdated>(`${environment.apiUrl}/brands/${data.id}`, {
            isActive: data.isActive,
        });
    }

    updateBrand(id: Brand['id'], data: UpdateBrand): Observable<BrandUpdated> {
        return this.http.patch<BrandUpdated>(`${environment.apiUrl}/brands/${id}`, data);
    }

    deleteBrand(id: Brand['id']): Observable<BrandDeleted> {
        return this.http.delete<BrandDeleted>(`${environment.apiUrl}/brands/${id}`);
    }
}

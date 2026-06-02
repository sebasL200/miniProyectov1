import { inject, Injectable } from '@angular/core';
import { BulkSaveBrandItem, SaveBrandRequest, SaveBrandResponse } from './types';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';
import { ApiResponse } from '../../../../shared/interfaces/api.interface';
import { Brand } from '../../../../shared/models/brand.model';

@Injectable({
    providedIn: 'root',
})
export class BrandService {
    private readonly http: HttpClient = inject(HttpClient);

    getBrandById(id: string): Observable<ApiResponse<Brand>> {
        return this.http.get<ApiResponse<Brand>>(`${environment.apiUrl}/brands/${id}`);
    }

    saveBrand(brand: SaveBrandRequest): Observable<SaveBrandResponse> {
        return this.http.post<SaveBrandResponse>(`${environment.apiUrl}/brands`, brand);
    }

    saveBrands(brands: BulkSaveBrandItem[]): Observable<SaveBrandResponse[]> {
        return this.http.post<SaveBrandResponse[]>(`${environment.apiUrl}/brands/batch`, { brands });
    }
}

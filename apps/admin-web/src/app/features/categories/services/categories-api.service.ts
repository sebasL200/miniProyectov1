import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  visibleInMenu: boolean;
  parentId?: string;
  parentName?: string;
  description?: string;
  imageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  hasAttributes: boolean;
  parent?: { id: string; name: string; slug: string };
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ListCategoriesResult {
  categories: (CategoryDto | null)[];
  totalCount?: number;
  totalPages?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class CategoriesApiService {
  private readonly baseUrl = 'http://localhost:3000/categories';

  constructor(private readonly http: HttpClient) {}

  listCategories(opts: { page?: number; pageSize?: number; query?: string; rootOnly?: boolean; parentId?: string } = {}): Observable<ListCategoriesResult> {
    let params = new HttpParams();
    if (opts.page) params = params.set('page', opts.page);
    if (opts.pageSize) params = params.set('pageSize', opts.pageSize);
    if (opts.query) params = params.set('query', opts.query);
    if (opts.rootOnly) params = params.set('rootOnly', 'true');
    if (opts.parentId) params = params.set('parentId', opts.parentId);
    return this.http.get<ApiResponse<ListCategoriesResult>>(this.baseUrl, { params }).pipe(map(r => r.data));
  }

  getCategory(id: string): Observable<CategoryDto> {
    return this.http.get<ApiResponse<CategoryDto>>(`${this.baseUrl}/${id}`).pipe(map(r => r.data));
  }

  createCategory(data: Record<string, unknown>): Observable<CategoryDto> {
    return this.http.post<ApiResponse<CategoryDto>>(this.baseUrl, data).pipe(map(r => r.data));
  }

  updateCategory(id: string, data: Record<string, unknown>): Observable<CategoryDto> {
    return this.http.patch<ApiResponse<CategoryDto>>(`${this.baseUrl}/${id}`, data).pipe(map(r => r.data));
  }

  deleteCategory(id: string): Observable<{ category: CategoryDto }> {
    return this.http.delete<ApiResponse<{ category: CategoryDto }>>(`${this.baseUrl}/${id}`).pipe(map(r => r.data));
  }
}

import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CategoriesQueryService } from '../../../../categories/services/categories-query/categories-query.service';
import { BrandsQueryService } from '../../../../brands/services/brands-query/brands-query.service';
import { AttributesQueryService } from '../../../../attributes/services/attributes-query/attributes-query.service';
import { CursorPaginationParams, SearchParams } from '../../../../../shared/interfaces';
import { ApiResponse } from '../../../../../shared/interfaces/api-response.interface';
import { Product } from '../../../../../shared/models';
import { environment } from '../../../../../../environments/environment';
import { CreateProductDto } from '@org/contracts';

import {
    AdditionalAttributesSearchParams,
    CategoryAttributesSearchParams,
} from './types';

type CreateProductResponse = ApiResponse<{ product: Product }>;

@Injectable({
    providedIn: 'root',
})
export class RegisterProductService {
    private readonly http = inject(HttpClient);
    private readonly categoriesQueryService = inject(CategoriesQueryService);
    private readonly brandsQueryService = inject(BrandsQueryService);
    private readonly attributesQueryService = inject(AttributesQueryService);

    categoriesCursorParams = signal<CursorPaginationParams>({
        paginationType: 'cursor',
        after: '',
        pageSize: 8,
        query: '',
    });

    brandsCursorParams = signal<CursorPaginationParams>({
        paginationType: 'cursor',
        after: '',
        pageSize: 8,
        query: '',
    });

    attributesCursorParams = signal<CursorPaginationParams>({
        paginationType: 'cursor',
        after: '',
        pageSize: 8,
        query: '',
    });

    categoryAttributesCursorParams = signal<CursorPaginationParams>({
        paginationType: 'cursor',
        after: '',
        pageSize: 1000,
        query: '',
    });

    selectedCategoryIds = signal<string[]>([]);

    searchCategories() {
        return this.categoriesQueryService.getCategoriesCursor(this.categoriesCursorParams());
    }

    searchBrands() {
        return this.brandsQueryService.getBrandsCursor(this.brandsCursorParams());
    }

    searchAttributes(
        additionalParams?: Partial<AdditionalAttributesSearchParams>,
        params: SearchParams = this.attributesCursorParams(),
    ) {
        return this.attributesQueryService.getAttributes(params, {
            ...additionalParams,
            appliesToAll: false,
        });
    }

    searchCategoryAttributes(
        additionalParams: CategoryAttributesSearchParams,
        params: SearchParams,
    ) {
        return this.attributesQueryService.getAttributes(params, {
            ...additionalParams,
            appliesToAll: true,
            or: 'categoryIds,appliesToAll',
        });
    }

    saveProduct(request: CreateProductDto) {
        return this.http.post<CreateProductResponse>(
            `${environment.apiUrl}/products`,
            request,
        );
    }

    searchAttributesBySelectedCategories() {
        return this.attributesQueryService.getAttributesCursorByCategoryIds(
            this.selectedCategoryIds(),
            this.categoryAttributesCursorParams(),
        );
    }

    resetCategoryAttributesCursor() {
        this.categoryAttributesCursorParams.update((prev) => ({
            ...prev,
            before: null,
            after: '',
        }));
    }
}

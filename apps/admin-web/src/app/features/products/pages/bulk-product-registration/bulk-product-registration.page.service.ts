import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { AttributesQueryService } from '../../../attributes/services/attributes-query/attributes-query.service';
import { BrandsQueryService } from '../../../brands/services/brands-query/brands-query.service';
import { CategoriesQueryService } from '../../../categories/services/categories-query/categories-query.service';
import { environment } from '../../../../../environments/environment';
import { ApiResponse, BatchData, CursorPaginationParams, SearchParams } from '../../../../shared/interfaces/api.interface';
import { AdditionalAttributesSearchParams, CategoryAttributesSearchParams } from '../../components/dialogs/register-product/types';
import { BulkSaveProductItem } from './types';

@Injectable({
    providedIn: 'root',
})
export class BulkProductRegistrationPageService {
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

    searchCategories() {
        return this.categoriesQueryService.getCategoriesCursor(
            this.categoriesCursorParams(),
        );
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

    saveBatchProducts(products: BulkSaveProductItem[]) {
        return this.http.post<ApiResponse<BatchData>>(
            `${environment.apiUrl}/products/batch`,
            { products },
        );
    }
}

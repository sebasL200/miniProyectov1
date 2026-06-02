import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AttributesQueryService } from '../../../attributes/services/attributes-query/attributes-query.service';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { BulkProductRegistrationPageService } from './bulk-product-registration.page.service';

describe('BulkProductRegistrationPageService', () => {
    let service: BulkProductRegistrationPageService;
    let attributesQueryService: AttributesQueryService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [provideHttpClient()],
        });

        service = TestBed.inject(BulkProductRegistrationPageService);
        attributesQueryService = TestBed.inject(AttributesQueryService);
    });

    it('should search product attributes with appliesToAll false by default', () => {
        const getAttributes = vi
            .spyOn(attributesQueryService, 'getAttributes')
            .mockReturnValue(of({}) as never);

        service.searchAttributes().subscribe();

        expect(getAttributes).toHaveBeenCalledWith(
            service.attributesCursorParams(),
            { appliesToAll: false },
        );
    });

    it('should force appliesToAll false for product attribute options', () => {
        const getAttributes = vi
            .spyOn(attributesQueryService, 'getAttributes')
            .mockReturnValue(of({}) as never);

        service.searchAttributes({
            categoryIds: 'category-id',
            appliesToAll: true as false,
        }).subscribe();

        expect(getAttributes).toHaveBeenCalledWith(
            service.attributesCursorParams(),
            { categoryIds: 'category-id', appliesToAll: false },
        );
    });

    it('should search category attributes with appliesToAll true', () => {
        const getAttributes = vi
            .spyOn(attributesQueryService, 'getAttributes')
            .mockReturnValue(of({}) as never);
        const params = { paginationType: 'none' as const, query: '' };

        service.searchCategoryAttributes({
            categoryIds: 'category-id',
        }, params).subscribe();

        expect(getAttributes).toHaveBeenCalledWith(
            params,
            {
                categoryIds: 'category-id',
                appliesToAll: true,
                or: 'categoryIds,appliesToAll',
            },
        );
    });
});

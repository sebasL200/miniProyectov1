import { TestBed } from '@angular/core/testing';

import { CategoriesQueryService } from './categories-query.service';

describe('CategoriesQuery', () => {
    let service: CategoriesQueryService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CategoriesQueryService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

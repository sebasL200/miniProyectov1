import { TestBed } from '@angular/core/testing';

import { SubcategoriesStateService } from './subcategories-state.service';

describe('SubcategoriesStateService', () => {
    let service: SubcategoriesStateService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SubcategoriesStateService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

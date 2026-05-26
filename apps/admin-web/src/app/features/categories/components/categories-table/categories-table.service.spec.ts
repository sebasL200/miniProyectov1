import { TestBed } from '@angular/core/testing';

import { CategoriesTableService } from './categories-table.service';

describe('CategoriesTableService', () => {
    let service: CategoriesTableService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CategoriesTableService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

import { TestBed } from '@angular/core/testing';

import { BrandsTableService } from './brands-table.service';

describe('BrandsTableService', () => {
    let service: BrandsTableService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BrandsTableService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

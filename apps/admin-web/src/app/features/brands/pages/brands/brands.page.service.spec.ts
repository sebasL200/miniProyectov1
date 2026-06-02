import { TestBed } from '@angular/core/testing';

import { BrandsPageService } from './brands.page.service';

describe('BrandsPageService', () => {
    let service: BrandsPageService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BrandsPageService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

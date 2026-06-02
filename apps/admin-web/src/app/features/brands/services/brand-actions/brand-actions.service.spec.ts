import { TestBed } from '@angular/core/testing';

import { BrandActionsService } from './brand-actions.service';

describe('BrandActionsService', () => {
    let service: BrandActionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BrandActionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

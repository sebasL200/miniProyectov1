import { TestBed } from '@angular/core/testing';

import { CategoryActionsService } from './category-actions.service';

describe('CategoryActionsService', () => {
    let service: CategoryActionsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(CategoryActionsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkCategoryRegistrationPage } from './bulk-category-registration.page';

describe('BulkCategoryRegistrationPage', () => {
    let component: BulkCategoryRegistrationPage;
    let fixture: ComponentFixture<BulkCategoryRegistrationPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BulkCategoryRegistrationPage],
        }).compileComponents();

        fixture = TestBed.createComponent(BulkCategoryRegistrationPage);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

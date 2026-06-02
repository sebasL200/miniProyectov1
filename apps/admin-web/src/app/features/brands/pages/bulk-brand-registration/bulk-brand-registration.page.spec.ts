import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkBrandRegistrationPage } from './bulk-brand-registration.page';

describe('BulkBrandRegistrationPage', () => {
    let component: BulkBrandRegistrationPage;
    let fixture: ComponentFixture<BulkBrandRegistrationPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BulkBrandRegistrationPage],
        }).compileComponents();

        fixture = TestBed.createComponent(BulkBrandRegistrationPage);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

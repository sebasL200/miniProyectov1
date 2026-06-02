import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BulkProductRegistrationPage } from './bulk-product-registration.page';

describe('BulkProductRegistrationPage', () => {
    let component: BulkProductRegistrationPage;
    let fixture: ComponentFixture<BulkProductRegistrationPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BulkProductRegistrationPage],
        }).compileComponents();

        fixture = TestBed.createComponent(BulkProductRegistrationPage);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

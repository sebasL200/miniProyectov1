import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTableActions } from './product-table-actions';

describe('ProductTableActions', () => {
    let component: ProductTableActions;
    let fixture: ComponentFixture<ProductTableActions>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductTableActions],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductTableActions);
        fixture.componentRef.setInput('options', {
            canAddOffer: true,
            canDelete: true,
            canEdit: true,
            canView: true,
        });
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

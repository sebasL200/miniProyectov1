import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductOverviewActions } from './product-overview-actions';

describe('ProductOverviewActions', () => {
    let component: ProductOverviewActions;
    let fixture: ComponentFixture<ProductOverviewActions>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductOverviewActions],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductOverviewActions);
        fixture.componentRef.setInput('totalCount', 0);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

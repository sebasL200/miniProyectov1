import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductDetailsDialog } from './product-details.dialog';

describe('ProductDetailsDialog', () => {
    let component: ProductDetailsDialog;
    let fixture: ComponentFixture<ProductDetailsDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductDetailsDialog],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductDetailsDialog);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

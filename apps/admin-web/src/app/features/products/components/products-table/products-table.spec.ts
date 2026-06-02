import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createPagination } from '../../../../shared/interfaces/pagination-options.interface';

import { ProductsTable } from './products-table';

describe('ProductsTable', () => {
    let component: ProductsTable;
    let fixture: ComponentFixture<ProductsTable>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ProductsTable],
        }).compileComponents();

        fixture = TestBed.createComponent(ProductsTable);
        fixture.componentRef.setInput('pagination', createPagination({}));
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

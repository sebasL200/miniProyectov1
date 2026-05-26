import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoriesTable } from './categories-table';

describe('CategoriesTable', () => {
    let component: CategoriesTable;
    let fixture: ComponentFixture<CategoriesTable>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CategoriesTable],
        }).compileComponents();

        fixture = TestBed.createComponent(CategoriesTable);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

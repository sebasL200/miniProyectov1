import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryTableActions } from './category-table-actions';

describe('CategoryTableActions', () => {
    let component: CategoryTableActions;
    let fixture: ComponentFixture<CategoryTableActions>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CategoryTableActions],
        }).compileComponents();

        fixture = TestBed.createComponent(CategoryTableActions);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

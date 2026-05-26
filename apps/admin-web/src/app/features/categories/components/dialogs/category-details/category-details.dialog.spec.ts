import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryDetailsDialog } from './category-details.dialog';

describe('CategoryDetailsDialog', () => {
    let component: CategoryDetailsDialog;
    let fixture: ComponentFixture<CategoryDetailsDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CategoryDetailsDialog],
        }).compileComponents();

        fixture = TestBed.createComponent(CategoryDetailsDialog);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

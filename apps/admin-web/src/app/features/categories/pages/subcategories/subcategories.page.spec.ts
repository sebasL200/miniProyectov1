import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubcategoriesPage } from './subcategories.page';

describe('SubcategoriesPage', () => {
    let component: SubcategoriesPage;
    let fixture: ComponentFixture<SubcategoriesPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SubcategoriesPage],
        }).compileComponents();

        fixture = TestBed.createComponent(SubcategoriesPage);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

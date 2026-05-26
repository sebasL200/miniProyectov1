import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryOverviewActions } from './category-overview-actions';

describe('CategoryOverviewActions', () => {
    let component: CategoryOverviewActions;
    let fixture: ComponentFixture<CategoryOverviewActions>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CategoryOverviewActions],
        }).compileComponents();

        fixture = TestBed.createComponent(CategoryOverviewActions);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

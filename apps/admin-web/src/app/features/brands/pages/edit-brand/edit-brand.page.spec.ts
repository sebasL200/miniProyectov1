import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBrandPage } from './edit-brand.page';

describe('EditBrandPage', () => {
    let component: EditBrandPage;
    let fixture: ComponentFixture<EditBrandPage>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [EditBrandPage],
        }).compileComponents();

        fixture = TestBed.createComponent(EditBrandPage);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

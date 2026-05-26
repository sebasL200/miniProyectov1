import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterCategoryDialog } from './register-category.dialog';

describe('RegisterCategoryDialog', () => {
    let component: RegisterCategoryDialog;
    let fixture: ComponentFixture<RegisterCategoryDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RegisterCategoryDialog],
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterCategoryDialog);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

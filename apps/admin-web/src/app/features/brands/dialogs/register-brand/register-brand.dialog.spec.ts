import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterBrandDialog } from './register-brand.dialog';

describe('RegisterBrandDialog', () => {
    let component: RegisterBrandDialog;
    let fixture: ComponentFixture<RegisterBrandDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RegisterBrandDialog],
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterBrandDialog);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

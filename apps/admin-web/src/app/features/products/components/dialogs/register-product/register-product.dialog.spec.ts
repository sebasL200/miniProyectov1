import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterProductDialog } from './register-product.dialog';

describe('RegisterProductDialog', () => {
    let component: RegisterProductDialog;
    let fixture: ComponentFixture<RegisterProductDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RegisterProductDialog],
        }).compileComponents();

        fixture = TestBed.createComponent(RegisterProductDialog);
        component = fixture.componentInstance;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { BrandDetailsDialog } from './brand-details.dialog';

describe('BrandDetailsDialog', () => {
    let component: BrandDetailsDialog;
    let fixture: ComponentFixture<BrandDetailsDialog>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BrandDetailsDialog],
            providers: [provideHttpClient()],
        }).compileComponents();

        fixture = TestBed.createComponent(BrandDetailsDialog);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

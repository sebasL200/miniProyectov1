import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandTableActions } from './brand-table-actions';

describe('BrandTableActions', () => {
    let component: BrandTableActions;
    let fixture: ComponentFixture<BrandTableActions>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BrandTableActions],
        }).compileComponents();

        fixture = TestBed.createComponent(BrandTableActions);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandOverviewActions } from './brand-overview-actions';

describe('BrandOverviewActions', () => {
    let component: BrandOverviewActions;
    let fixture: ComponentFixture<BrandOverviewActions>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BrandOverviewActions],
        }).compileComponents();

        fixture = TestBed.createComponent(BrandOverviewActions);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

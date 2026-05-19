import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruncateText } from './truncate-text';

describe('TruncateText', () => {
    let component: TruncateText;
    let fixture: ComponentFixture<TruncateText>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [TruncateText],
        }).compileComponents();

        fixture = TestBed.createComponent(TruncateText);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

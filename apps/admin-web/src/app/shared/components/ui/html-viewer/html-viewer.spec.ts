import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HtmlViewer } from './html-viewer';

describe('HtmlViewer', () => {
    let component: HtmlViewer;
    let fixture: ComponentFixture<HtmlViewer>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HtmlViewer],
        }).compileComponents();

        fixture = TestBed.createComponent(HtmlViewer);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogsPageComponent } from './catalogs-page';
import { provideRouter } from '@angular/router';

describe('CatalogsPageComponent', () => {
  let component: CatalogsPageComponent;
  let fixture: ComponentFixture<CatalogsPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogsPageComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

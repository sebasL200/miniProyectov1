import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogLinkCardComponent } from './catalog-link-card';
import { provideRouter } from '@angular/router';
import { faBoxes } from '@fortawesome/free-solid-svg-icons';

describe('CatalogLinkCardComponent', () => {
  let component: CatalogLinkCardComponent;
  let fixture: ComponentFixture<CatalogLinkCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogLinkCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogLinkCardComponent);
    component = fixture.componentInstance;
    component.item = {
      label: 'Test Catalog',
      icon: faBoxes,
      href: 'test'
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CatalogLinkCard } from './catalog-link-card';
import { provideRouter } from '@angular/router';
import { faBoxes } from '@fortawesome/free-solid-svg-icons';

describe('CatalogLinkCard', () => {
  let component: CatalogLinkCard;
  let fixture: ComponentFixture<CatalogLinkCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogLinkCard],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogLinkCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test Catalog');
    fixture.componentRef.setInput('icon', faBoxes);
    fixture.componentRef.setInput('href', 'test');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

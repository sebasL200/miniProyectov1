import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductVariantDetailsDialog } from './product-variant-details.dialog';

describe('ProductVariantDetailsDialog', () => {
  let component: ProductVariantDetailsDialog;
  let fixture: ComponentFixture<ProductVariantDetailsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductVariantDetailsDialog],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductVariantDetailsDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

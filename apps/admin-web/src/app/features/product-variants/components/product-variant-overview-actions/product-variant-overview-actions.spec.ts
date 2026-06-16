import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductVariantOverviewActions } from './product-variant-overview-actions';

describe('ProductVariantOverviewActions', () => {
  let component: ProductVariantOverviewActions;
  let fixture: ComponentFixture<ProductVariantOverviewActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductVariantOverviewActions],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductVariantOverviewActions);
    fixture.componentRef.setInput('totalCount', 0);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

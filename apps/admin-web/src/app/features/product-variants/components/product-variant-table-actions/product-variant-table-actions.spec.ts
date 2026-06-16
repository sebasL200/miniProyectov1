import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductVariantTableActions } from './product-variant-table-actions';

describe('ProductVariantTableActions', () => {
  let component: ProductVariantTableActions;
  let fixture: ComponentFixture<ProductVariantTableActions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductVariantTableActions],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductVariantTableActions);
    fixture.componentRef.setInput('options', {
      canEdit: true,
      canView: true,
      canDelete: true,
    });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductVariantAttributesTable } from './product-variant-attributes-table';

describe('ProductVariantAttributesTable', () => {
  let component: ProductVariantAttributesTable;
  let fixture: ComponentFixture<ProductVariantAttributesTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductVariantAttributesTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductVariantAttributesTable);
    fixture.componentRef.setInput('attributes', [
      { id: 'color', name: 'Color', slug: 'color', isRequired: true },
      { id: 'size', name: 'Size', slug: 'size', isRequired: false },
    ]);
    fixture.componentRef.setInput('directAttributes', [
      { id: 'size', name: 'Size', slug: 'size', isRequired: false },
    ]);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not render the attribute type column', () => {
    expect(fixture.nativeElement.textContent).not.toContain('Tipo');
    expect(fixture.nativeElement.textContent).not.toContain('Obligatorio');
    expect(fixture.nativeElement.textContent).not.toContain('Opcional');
  });

  it('does not render row reorder controls', () => {
    expect(fixture.nativeElement.textContent).not.toContain('⋮⋮');
    expect(
      fixture.nativeElement.querySelector('[aria-label="Reordenar fila"]'),
    ).toBeNull();
  });
});

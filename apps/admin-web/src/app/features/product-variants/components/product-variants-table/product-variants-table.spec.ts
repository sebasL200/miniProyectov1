import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createPagination } from '@shared/interfaces';

import { ProductVariantsTable } from './product-variants-table';

describe('ProductVariantsTable', () => {
  let component: ProductVariantsTable;
  let fixture: ComponentFixture<ProductVariantsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductVariantsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductVariantsTable);
    fixture.componentRef.setInput(
      'pagination',
      createPagination({
        showPagination: true,
        page: 1,
        size: 5,
        total: 0,
        pages: 1,
      }),
    );
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('constrains product images to a compact cropped thumbnail', async () => {
    fixture.componentRef.setInput('data', [
      {
        data: {
          _recordKey: 'variant-1',
          product: {
            id: 'product-1',
            name: 'Producto',
            slug: 'producto',
          },
          sku: 'SKU-12345',
          imageUrls: ['https://example.com/large-image.png'],
        },
      },
    ]);
    fixture.detectChanges();
    await fixture.whenStable();

    const image = fixture.nativeElement.querySelector(
      'ecom-image',
    ) as HTMLElement;

    expect(image.className).toContain('h-10');
    expect(image.className).toContain('w-10');
    expect(image.className).toContain('object-cover');
  });
});

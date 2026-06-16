import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';

import { ProductVariantsPage } from './product-variants.page';

describe('ProductVariantsPage', () => {
  let component: ProductVariantsPage;
  let fixture: ComponentFixture<ProductVariantsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductVariantsPage],
      providers: [
        provideHttpClient(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductVariantsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

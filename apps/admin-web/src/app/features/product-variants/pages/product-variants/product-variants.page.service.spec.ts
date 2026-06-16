import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { ProductVariantsPageService } from './product-variants.page.service';

describe('ProductVariantsPageService', () => {
  let service: ProductVariantsPageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ProductVariantsPageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

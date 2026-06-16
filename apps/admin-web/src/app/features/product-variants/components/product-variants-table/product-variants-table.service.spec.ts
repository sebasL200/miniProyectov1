import { TestBed } from '@angular/core/testing';

import { ProductVariantsTableService } from './product-variants-table.service';

describe('ProductVariantsTableService', () => {
  let service: ProductVariantsTableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProductVariantsTableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

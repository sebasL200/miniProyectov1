import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { ProductVariantTableActionEvent } from './types';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantsTableService {
  readonly pageChange$ = new Subject<number>();
  readonly actionProductVariant$ = new Subject<ProductVariantTableActionEvent>();
}

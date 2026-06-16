import { Injectable } from '@angular/core';
import { ProductSummary } from '@shared/models';
import { BehaviorSubject, Subject } from 'rxjs';
import { ProductVariantFormControlName } from './types';

@Injectable({
  providedIn: 'root',
})
export class ProductVariantFormService {
  readonly loadMoreProducts$ = new Subject<void>();
  readonly searchProducts$ = new Subject<string>();
  readonly selectedProductChange$ = new Subject<ProductSummary | null>();

  private disabledControls: Partial<Record<ProductVariantFormControlName, boolean>> =
    {};
  readonly disabledControls$ = new BehaviorSubject<
    Partial<Record<ProductVariantFormControlName, boolean>>
  >({});

  disableControl(
    controlName: ProductVariantFormControlName,
    disabled: boolean,
  ): void {
    this.disabledControls = {
      ...this.disabledControls,
      [controlName]: disabled,
    };
    this.disabledControls$.next(this.disabledControls);
  }
}

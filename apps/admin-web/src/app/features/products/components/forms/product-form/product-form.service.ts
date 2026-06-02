import { Injectable } from '@angular/core';
import { AttributeSummary } from '../../../../../shared/models/attribute.model';
import { CategorySummary } from '../../../../../shared/models/category.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { ProductFormData } from './types';

@Injectable({
    providedIn: 'root',
})
export class ProductFormService {

    loadMoreCategories$ = new Subject<void>();
    loadMoreBrands$ = new Subject<void>();
    loadMoreAttributes$ = new Subject<void>();
    selectedCategoriesChange$ = new Subject<CategorySummary[]>();
    loadAttributesByCategory$ = new Subject<AttributeSummary[]>();

    attributesByCategoriesLoaded$ = new Subject<AttributeSummary[]>();
    private disabledControls: Partial<Record<keyof ProductFormData, boolean>> = {};
    disabledControls$ = new BehaviorSubject<Partial<Record<keyof ProductFormData, boolean>>>({});

    disableControl(controlName: keyof ProductFormData, disabled: boolean): void {
        this.disabledControls = {
            ...this.disabledControls,
            [controlName]: disabled,
        };
        this.disabledControls$.next(this.disabledControls);
    }
}

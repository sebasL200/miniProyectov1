import { Injectable } from '@angular/core';
import { BrandRecord, BrandStatusChange, BrandVisibleInMenuChange } from './types';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class BrandsTableService {
    brandStatusChange$ = new Subject<BrandStatusChange>();
    brandVisibleInMenuChange$ = new Subject<BrandVisibleInMenuChange>();
    pageChange$ = new Subject<number>();
    editBrand$ = new Subject<BrandRecord>();
    viewBrand$ = new Subject<BrandRecord>();
    deleteBrand$ = new Subject<BrandRecord>();
}

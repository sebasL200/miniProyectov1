import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import {
    ProductFeaturedChange,
    ProductStatusChange,
    ProductTableActionEvent,
} from './types';

@Injectable({
    providedIn: 'root',
})
export class ProductsTableService {

    pageChange$ = new Subject<number>();
    productStatusChange$ = new Subject<ProductStatusChange>();
    productFeaturedChange$ = new Subject<ProductFeaturedChange>();
    actionProduct$ = new Subject<ProductTableActionEvent>();
}

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { CategoryStatusChange, CategoryTableActionEvent, CategoryVisibleInMenuChange } from './types';

@Injectable({
    providedIn: 'root',
})
export class CategoriesTableService {
    categoryStatusChange$ = new Subject<CategoryStatusChange>();
    categoryVisibleInMenuChange$ = new Subject<CategoryVisibleInMenuChange>();
    pageChange$ = new Subject<number>();
    actionCategory$ = new Subject<CategoryTableActionEvent>();
}

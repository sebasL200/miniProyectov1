import { Routes } from '@angular/router';

export const catalogsRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/catalogs-page/catalogs-page').then((m) => m.CatalogsPageComponent),
  },
];

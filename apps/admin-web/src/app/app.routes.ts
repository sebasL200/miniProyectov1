import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: '',
        redirectTo: 'catalogos',
        pathMatch: 'full',
      },
      {
        path: 'catalogos',
        loadComponent: () =>
          import('./categories/pages/catalogs/catalogs.page').then((m) => m.CatalogsPage),
      },
      {
        path: 'catalogos/categorias',
        loadComponent: () =>
          import('./categories/pages/categories/categories.page').then((m) => m.CategoriesPage),
      },
    ],
  },
];

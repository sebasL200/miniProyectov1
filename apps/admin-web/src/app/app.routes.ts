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
          import('./features/catalogs/pages/catalogs-page/catalogs-page').then((m) => m.CatalogsPageComponent),
      },
      {
        path: 'catalogos/categorias',
        loadComponent: () =>
          import('./features/categories/pages/categories/categories.page').then((m) => m.CategoriesPage),
      },
    ],
  },
];

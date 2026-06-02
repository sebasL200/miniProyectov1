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
        loadChildren: () =>
          import('./features/catalogs/catalogs.routes').then((m) => m.catalogsRoutes),
      },
      {
        path: 'catalogos/categorias',
        loadChildren: () =>
          import('./features/categories/categories.routes').then((m) => m.categoriesRoutes),
      },
      {
        path: 'catalogos/marcas',
        loadChildren: () =>
          import('./features/brands/brands.routes').then((m) => m.brandRoutes),
      },
      {
        path: 'catalogos/productos',
        loadChildren: () =>
          import('./features/products/products.routes').then((m) => m.productRoutes),
      },
    ],
  },
];


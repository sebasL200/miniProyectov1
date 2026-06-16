import { Routes } from '@angular/router';

export const productVariantsRoutes: Routes = [
  {
    path: 'register',
    loadComponent: () =>
      import(
        '@product-variants/pages/register-product-variant/register-product-variant.page'
      ).then((m) => m.RegisterProductVariantPage),
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import(
        '@product-variants/pages/edit-product-variant/edit-product-variant.page'
      ).then((m) => m.EditProductVariantPage),
  },
  {
    path: '',
    loadComponent: () =>
      import('@product-variants/pages/product-variants/product-variants.page').then(
        (m) => m.ProductVariantsPage,
      ),
  },
];

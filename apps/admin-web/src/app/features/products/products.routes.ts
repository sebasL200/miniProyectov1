import { Routes } from "@angular/router";

export const productRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/products/products.page').then(m => m.ProductsPage)
    },
    {
        path: 'bulk-registration',
        loadComponent: () => import('./pages/bulk-product-registration/bulk-product-registration.page').then(m => m.BulkProductRegistrationPage)
    },
    {
        path: ':id/edit',
        loadComponent: () => import('./pages/edit-product/edit-product.page').then(m => m.EditProductPage)
    },
]

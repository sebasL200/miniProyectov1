import { Routes } from "@angular/router";

export const brandRoutes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/brands/brands.page').then(m => m.BrandsPage)
    },
    {
        path: 'edit/:id',
        loadComponent: () => import('./pages/edit-brand/edit-brand.page').then(m => m.EditBrandPage)
    },
    {
        path: 'bulk-registration',
        loadComponent: () => import('./pages/bulk-brand-registration/bulk-brand-registration.page').then(m => m.BulkBrandRegistrationPage)
    }
]

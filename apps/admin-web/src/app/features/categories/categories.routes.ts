import { Routes } from '@angular/router';

export const categoriesRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./pages/categories/categories.page').then((m) => m.CategoriesPage),
    },
    {
        path: 'bulk-registration',
        loadComponent: () =>
            import('./pages/bulk-category-registration/bulk-category-registration.page').then(
                (m) => m.BulkCategoryRegistrationPage,
            ),
    },
    {
        path: ':id/subcategories',
        loadComponent: () =>
            import('./pages/subcategories/subcategories.page').then((m) => m.SubcategoriesPage),
    },
];

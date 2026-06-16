import { Routes } from '@angular/router';

export const attributesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/attributes-page/attributes-page').then(
        (m) => m.AttributesPageComponent,
      ),
  },
];

import { Routes } from '@angular/router';
import { SandboxComponent } from './component/sandbox/sandbox.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomepageComponent } from './component/homepage/homepage.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomepageComponent },
      { path: 'sandbox', component: SandboxComponent },
      {
        path: 'products',
        loadComponent: () =>
          import('./component/products/products.component').then(
            (m) => m.ProductsComponent
          ),
      },
    ],
  },
  // { path: '**', redirectTo: 'sandbox' },
];

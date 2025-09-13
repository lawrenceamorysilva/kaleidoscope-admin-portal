import { Routes } from '@angular/router';
import { SandboxComponent } from './component/sandbox/sandbox.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomepageComponent } from './component/homepage/homepage.component';
import { AdminLoginComponent } from './component/admin-login/admin-login.component';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  // Login page (standalone)
  { path: 'login', component: AdminLoginComponent },

  // Main pages (protected)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard], // <-- protect all child pages
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
      {
        path: 'products-hidden',
        loadComponent: () =>
          import('./component/products/products.component').then(
            (m) => m.ProductsComponent
          ),
        data: { title: 'Non-Dropship Products' },
      },
    ],
  },

  // Wildcard redirect
  { path: '**', redirectTo: 'login' },
];

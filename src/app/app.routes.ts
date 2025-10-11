import { Routes } from '@angular/router';
import { SandboxComponent } from './component/sandbox/sandbox.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { HomepageComponent } from './component/homepage/homepage.component';
import { AdminLoginComponent } from './component/admin-login/admin-login.component';
import { ExportHistoryComponent } from './component/export-history/export-history.component';
import { AuthGuard } from './core/auth.guard';

export const routes: Routes = [
  // Login page (standalone)
  { path: 'login', component: AdminLoginComponent },

  // Main pages (protected)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', component: HomepageComponent },
      { path: 'export-history', component: ExportHistoryComponent },
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
      //General Settings Page
      {
        path: 'general-settings',
        loadComponent: () =>
          import('./component/general-settings/general-settings.component').then(
            (m) => m.GeneralSettingsComponent
          ),
      },
    ],
  },

  // Wildcard redirect
  { path: '**', redirectTo: 'login' },
];

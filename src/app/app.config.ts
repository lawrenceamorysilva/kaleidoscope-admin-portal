import {
  ApplicationConfig,
  importProvidersFrom,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

// ✅ Import your standalone components
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { SandboxComponent } from './component/sandbox/sandbox.component';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),

    // ✅ Register both standalone components
    importProvidersFrom(MainLayoutComponent, SandboxComponent),
  ],
};

import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from '@app/services/admin-auth.service';
import { environment } from '@environments/environment';

export const adminAuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  let clonedReq = req;
  const token = auth.getToken();

  if (token) {
    const apiUrl = environment.apiUrl.toLowerCase();

    // ✅ Shared-host / staging / live: use query or body injection
    if (apiUrl.includes('staging-api') || apiUrl.includes('api.kaleidoscope.com.au')) {
      const method = req.method.toUpperCase();

      if (method === 'GET' || method === 'HEAD') {
        // 🔹 For GET requests — append as query param
        const url = new URL(req.url, window.location.origin);
        url.searchParams.set('api_token', token);
        clonedReq = req.clone({ url: url.toString() });
      } else {
        // 🔹 For POST / PUT / PATCH / DELETE — inject into body
        let newBody: any;

        if (req.body instanceof FormData) {
          // Handle FormData (append)
          newBody = req.body;
          newBody.append('api_token', token);
        } else {
          // Handle JSON body
          newBody = { ...req.body, api_token: token };
        }

        clonedReq = req.clone({ body: newBody });
      }
    } else {
      // ✅ Local/dev: use standard Authorization header
      clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }
  }

  // ✅ Global 401 handling
  return next(clonedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        console.warn('401 detected — admin auto-logout triggered.');
        auth.clearSession();
        setTimeout(() => {
          router.navigate(['/login'], { queryParams: { expired: '1' } });
        }, 50);
      }

      return throwError(() => err);
    })
  );
};

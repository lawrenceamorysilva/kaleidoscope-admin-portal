import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from '@app/services/admin-auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);

  const token = auth.getToken();
  const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers;

  return next(req.clone({ headers })).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.clearSession();

        // Use setTimeout to avoid "Navigation triggered outside Angular zone" errors
        setTimeout(() => {
          router.navigate(['/login'], { queryParams: { expired: '1' } });
        }, 50);
      }

      return throwError(() => err);
    })
  );
};

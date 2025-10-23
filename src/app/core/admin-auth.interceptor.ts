import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AdminAuthService } from '@app/services/admin-auth.service';
import { environment } from '@environments/environment';

export const adminAuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  const auth = inject(AdminAuthService);
  const router = inject(Router);
  const token = auth.getToken();

  let clonedReq = req;
  const apiBase = environment.apiUrl.toLowerCase();
  const isStaging = apiBase.includes('staging-api.kaleidoscope.com.au');
  const isLive = apiBase.includes('api.kaleidoscope.com.au');

  if (token) {
    const method = req.method.toUpperCase();

    // ✅ Staging / Live — use api_token param
    if (isStaging || isLive) {
      if (method === 'GET' || method === 'HEAD') {
        const url = new URL(req.url, apiBase);
        url.searchParams.set('api_token', token);
        clonedReq = req.clone({ url: url.toString() });
      } else if (req.body instanceof FormData) {
        const newBody = req.body;
        newBody.append('api_token', token);
        clonedReq = req.clone({ body: newBody });
      } else {
        const newBody = { ...(req.body || {}), api_token: token };
        clonedReq = req.clone({ body: newBody });
      }
    } else {
      // ✅ Local — use Authorization header
      clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }
  }

  return next(clonedReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.clearSession();
        setTimeout(() => {
          router.navigate(['/login'], { queryParams: { expired: '1' } });
        }, 50);
      }
      return throwError(() => err);
    })
  );
};

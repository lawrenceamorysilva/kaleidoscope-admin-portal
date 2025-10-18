import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AdminAuthService } from '@app/services/admin-auth.service';

export const adminAuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const auth = inject(AdminAuthService);
  const token = auth.getToken();
  const headers = token ? req.headers.set('Authorization', `Bearer ${token}`) : req.headers;
  return next(req.clone({ headers }));
};

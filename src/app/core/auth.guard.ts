import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AdminAuthService } from '@app/services/admin-auth.service';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private adminAuth: AdminAuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    if (!this.adminAuth.isLoggedIn()) {
      this.setRedirect(state.url, 'You must log in first to access that page.');
      return of(this.router.parseUrl('/login'));
    }

    return this.adminAuth.me().pipe(
      map(user => {
        if (user) {
          return true; // ✅ valid session
        }
        this.setRedirect(state.url, 'Your session has expired. Please log in again.');
        return this.router.parseUrl('/login');
      })
    );
  }

  private setRedirect(url: string, message: string) {
    localStorage.setItem('redirectAfterLogin', url);
    localStorage.setItem('loginRequiredMessage', message);
  }
}

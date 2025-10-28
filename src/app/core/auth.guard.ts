import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { AdminAuthService } from '@app/services/admin-auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private adminAuth: AdminAuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const token = this.adminAuth.getToken();
    const expiry = this.adminAuth.getExpiry();

    // 🚫 No token or expiry means not logged in
    if (!token || !expiry) {
      this.handleUnauthorized(state.url);
      return this.router.parseUrl('/login');
    }

    // 🚫 Token expired — clear and redirect
    if (this.adminAuth.isTokenExpired()) {
      this.handleSessionExpired(state.url);
      return this.router.parseUrl('/login');
    }

    // ✅ Token is valid
    return true;
  }

  /** Handles missing/unauthorized token */
  private handleUnauthorized(redirectUrl: string): void {
    this.adminAuth.clearSession();
    localStorage.setItem('loginRequiredMessage', 'Please log in to continue.');
    localStorage.setItem('redirectAfterLogin', redirectUrl);
  }

  /** Handles session expiry */
  private handleSessionExpired(redirectUrl: string): void {
    this.adminAuth.clearSession();
    localStorage.setItem('sessionExpired', '1');
    localStorage.setItem('redirectAfterLogin', redirectUrl);
  }
}

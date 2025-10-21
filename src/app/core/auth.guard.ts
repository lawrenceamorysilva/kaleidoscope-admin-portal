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

    // 🚫 No token = not logged in or session expired
    if (!token) {
      this.handleUnauthorized(state.url);
      return this.router.parseUrl('/login');
    }

    // ✅ Optionally: check for token validity (expired/invalid)
    if (this.adminAuth.isTokenExpired(token)) {
      this.handleSessionExpired(state.url);
      return this.router.parseUrl('/login');
    }

    return true;
  }

  /**
   * Handles generic unauthorized access (no token)
   */
  private handleUnauthorized(redirectUrl: string): void {
    this.adminAuth.clearSession();
    localStorage.setItem('loginRequiredMessage', 'Please log in to continue.');
    localStorage.setItem('redirectAfterLogin', redirectUrl);
  }

  /**
   * Handles expired session with a clear user message
   */
  private handleSessionExpired(redirectUrl: string): void {
    this.adminAuth.clearSession();
    localStorage.setItem('sessionExpired', '1');
    localStorage.setItem('redirectAfterLogin', redirectUrl);
  }
}

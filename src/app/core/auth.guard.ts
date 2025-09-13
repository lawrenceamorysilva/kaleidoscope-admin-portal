import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AdminAuthService } from '@app/services/admin-auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private adminAuth: AdminAuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (this.adminAuth.isLoggedIn()) {
      return true;
    } else {
      localStorage.setItem('redirectAfterLogin', state.url);
      localStorage.setItem('loginRequiredMessage', 'You must log in first to access that page.');
      return this.router.parseUrl('/login');
    }
  }

}

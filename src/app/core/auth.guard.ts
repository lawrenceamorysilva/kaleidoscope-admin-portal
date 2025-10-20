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

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    if (!this.adminAuth.isLoggedIn() || !this.adminAuth.currentUser?.id) {
      this.setRedirect(state.url, 'You must log in first to access that page.');
      return this.router.parseUrl('/login');
    }
    return true;
  }


  private setRedirect(url: string, message: string) {
    localStorage.setItem('redirectAfterLogin', url);
    localStorage.setItem('loginRequiredMessage', message);
  }
}

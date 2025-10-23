import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of, BehaviorSubject } from 'rxjs';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active?: boolean;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  // Matches Laravel route: /api/auth/admin/login
  private authUrl = `${environment.apiUrl}/auth/admin`;
  // Matches protected routes under /api/admin/...
  private adminUrl = `${environment.apiUrl}/admin`;

  currentUser: AdminUser | null = null;
  loginError$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Try to restore session from localStorage
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');

    if (token && storedUser) {
      this.currentUser = { ...JSON.parse(storedUser), token };
    }
  }

  /** Get token from memory or localStorage */
  getToken(): string | null {
    return this.currentUser?.token ?? localStorage.getItem('adminToken');
  }

  /** Admin login */
  login(credentials: { email: string; password: string }): Observable<AdminUser | null> {
    return this.http.post<{ token: string; user: AdminUser }>(
      `${this.authUrl}/login`,
      credentials
    ).pipe(
      tap(res => {
        const user: AdminUser = { ...res.user, token: res.token };
        this.currentUser = user;

        localStorage.setItem('adminToken', res.token);
        localStorage.setItem('adminUser', JSON.stringify(res.user));
      }),
      map(res => ({ ...res.user, token: res.token } as AdminUser)),
      catchError(() => of(null))
    );
  }

  /** Clears session and redirects to login */
  clearSession(): void {
    this.currentUser = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('loginRequiredMessage');
    localStorage.removeItem('sessionExpired');
    this.loginError$.next('Your session has expired. Please log in again.');
  }

  /** Logs out locally + optionally via API */
  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.adminUrl}/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }

    this.router.navigate(['/login']);
  }

  /** Simple token existence + expiration check */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /** Checks if JWT-style token expired (if timestamped) */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      // If not JWT format, treat as non-expiring hybrid token
      return false;
    }
  }
}

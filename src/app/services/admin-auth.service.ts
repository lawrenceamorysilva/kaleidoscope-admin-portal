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
  is_active: boolean;
  token?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  private apiUrl = `${environment.apiUrl}/admin`;
  currentUser: AdminUser | null = null;
  loginError$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Try to restore session
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');

    if (token && storedUser) {
      this.currentUser = { ...JSON.parse(storedUser), token };
    } else if (token) {
      // Token exists but no user info → try fetching from backend
      this.fetchCurrentUser();
    }
  }

  /**
   * Retrieve JWT token from memory or storage
   */
  getToken(): string | null {
    return this.currentUser?.token ?? localStorage.getItem('adminToken');
  }

  /**
   * Perform login and store user + token
   */
  login(credentials: { email: string; password: string }): Observable<AdminUser | null> {
    return this.http.post<{ access_token: string; user?: AdminUser }>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(res => {
        const user: AdminUser = { ...res.user, token: res.access_token } as AdminUser;
        this.currentUser = user;

        localStorage.setItem('adminToken', res.access_token);
        localStorage.setItem('adminUser', JSON.stringify(res.user));
      }),
      map(res => ({ ...res.user, token: res.access_token } as AdminUser)),
      catchError(() => of(null))
    );
  }

  /**
   * Re-fetch user info if we have a valid token
   */
  fetchCurrentUser(): void {
    const token = this.getToken();
    if (!token) return;

    this.http.get<AdminUser>(`${this.apiUrl}/me`).subscribe({
      next: (user) => {
        this.currentUser = { ...user, token };
        localStorage.setItem('adminUser', JSON.stringify(user));
      },
      error: () => {
        // Token invalid, clear everything
        this.clearSession();
      }
    });
  }

  /**
   * Clear all session data and emit login error if needed
   */
  clearSession(): void {
    this.currentUser = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('loginRequiredMessage');
    localStorage.removeItem('sessionExpired');
    this.loginError$.next('Your session has expired. Please log in again.');
  }

  /**
   * Logout — if force=true, skip backend call
   */
  logout(force = false): Observable<any> | void {
    const token = this.getToken();

    // Skip backend logout if no token or force mode
    if (force || !token) {
      this.clearSession();
      this.router.navigate(['/login']);
      return;
    }

    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.clearSession();
        this.router.navigate(['/login']);
      }),
      catchError(() => {
        // Fallback cleanup on error
        this.clearSession();
        this.router.navigate(['/login']);
        return of(null);
      })
    );
  }

  /**
   * Simple JWT expiry check
   */
  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  /**
   * Check current login state
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }
}

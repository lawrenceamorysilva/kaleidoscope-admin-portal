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
  private authUrl = `${environment.apiUrl}/auth/admin`;
  private adminUrl = `${environment.apiUrl}/admin`;

  currentUser: AdminUser | null = null;
  loginError$ = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    // Restore session if available
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');
    const expiry = localStorage.getItem('adminTokenExpiry');

    if (token && storedUser && expiry) {
      this.currentUser = { ...JSON.parse(storedUser), token };
    }
  }

  /** Get stored token */
  getToken(): string | null {
    return this.currentUser?.token ?? localStorage.getItem('adminToken');
  }

  /** Get expiry timestamp */
  getExpiry(): string | null {
    return localStorage.getItem('adminTokenExpiry');
  }

  /** Admin login */
  login(credentials: { email: string; password: string }): Observable<AdminUser | null> {
    return this.http.post<{ token: string; expires_at: string; user: AdminUser }>(
      `${this.authUrl}/login`,
      credentials
    ).pipe(
      tap(res => {
        const user: AdminUser = { ...res.user, token: res.token };
        this.currentUser = user;

        localStorage.setItem('adminToken', res.token);
        localStorage.setItem('adminUser', JSON.stringify(res.user));
        localStorage.setItem('adminTokenExpiry', res.expires_at);
      }),
      map(res => ({ ...res.user, token: res.token } as AdminUser)),
      catchError(() => of(null))
    );
  }

  /** Clears session and resets flags */
  clearSession(): void {
    this.currentUser = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('adminTokenExpiry');
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('loginRequiredMessage');
    localStorage.removeItem('sessionExpired');
    this.loginError$.next('Your session has expired. Please log in again.');
  }

  /** Logs out locally and via API (if possible) */
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

  /** Checks if user is logged in (token + valid expiry) */
  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired();
  }

  /** Checks if expiry date is past current time */
  isTokenExpired(): boolean {
    const expiry = this.getExpiry();
    if (!expiry) return true;
    const expiryDate = new Date(expiry);
    return expiryDate.getTime() < Date.now();
  }
}

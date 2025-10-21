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
    // Try to restore session from localStorage
    const token = localStorage.getItem('adminToken');
    const storedUser = localStorage.getItem('adminUser');

    if (token && storedUser) {
      this.currentUser = { ...JSON.parse(storedUser), token };
    }
    // Do NOT auto-fetch /me here; let login or guarded pages fetch if needed
  }

  getToken(): string | null {
    return this.currentUser?.token ?? localStorage.getItem('adminToken');
  }

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

  clearSession(): void {
    this.currentUser = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('loginRequiredMessage');
    localStorage.removeItem('sessionExpired');
    this.loginError$.next('Your session has expired. Please log in again.');
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
}

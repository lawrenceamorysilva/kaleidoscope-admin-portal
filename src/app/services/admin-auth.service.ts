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

  fetchCurrentUser(): void {
    const token = this.getToken();
    if (!token) return;

    this.http.get<AdminUser>(`${this.apiUrl}/me`).subscribe({
      next: (user) => {
        this.currentUser = { ...user, token };
        localStorage.setItem('adminUser', JSON.stringify(user));
      },
      error: () => {
        // token invalid, clear everything
        this.clearSession();
      }
    });
  }

  clearSession(): void {
    this.currentUser = null;
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    this.loginError$.next('Your session has expired. Please log in again.');
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

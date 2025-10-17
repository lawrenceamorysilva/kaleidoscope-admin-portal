import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private apiUrl = `${environment.apiUrl}/admin`;
  currentUser: AdminUser | null = null;

  constructor(private http: HttpClient) {}

  /** Login via session-based auth */
  login(credentials: { email: string; password: string }): Observable<AdminUser | null> {
    return this.http.post<{ user: AdminUser }>(`${this.apiUrl}/login`, credentials, { withCredentials: true }).pipe(
      tap(res => this.currentUser = res.user),
      map(res => res.user),
      catchError(err => {
        console.error('Login failed', err);
        return of(null);
      })
    );
  }

  /** Get current logged-in admin */
  me(): Observable<AdminUser | null> {
    return this.http.get<AdminUser>(`${this.apiUrl}/me`, { withCredentials: true }).pipe(
      tap(user => this.currentUser = user),
      catchError(() => {
        this.clearAuth();
        return of(null);
      })
    );
  }

  /** Logout */
  logout(): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => this.clearAuth()),
      map(() => true),
      catchError(() => {
        this.clearAuth();
        return of(true);
      })
    );
  }

  /** Clear current user state */
  clearAuth() {
    this.currentUser = null;
  }

  /** Quick check if user is logged in */
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }
}

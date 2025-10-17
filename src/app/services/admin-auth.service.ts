import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@environments/environment';
import {Observable, of, switchMap} from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface LoginResponse {
  access_token: string;
  token_type: string;
  user: AdminUser;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private apiUrl = `${environment.apiUrl}/admin`;
  private tokenKey = 'admin_token';

  currentUser: AdminUser | null = null;

  constructor(private http: HttpClient) {}

  /** Store token locally */
  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token);
  }

  /** Clear token + user */
  private clearAuth() {
    localStorage.removeItem(this.tokenKey);
    this.currentUser = null;
  }

  /** Build headers if token exists */
  private authHeaders(): HttpHeaders | undefined {
    const token = this.getToken();
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  /** Login with credentials */
  /** Login with credentials using Sanctum */
  login(credentials: { email: string; password: string }): Observable<AdminUser | null> {
    // Step 1: get CSRF cookie
    return this.http.get(`${this.apiUrl}/sanctum/csrf-cookie`, { withCredentials: true }).pipe(
      switchMap(() =>
        // Step 2: post login credentials
        this.http.post<AdminUser>(`${this.apiUrl}/admin/login`, credentials, { withCredentials: true }).pipe(
          tap(user => this.currentUser = user),
          catchError(err => {
            console.error('Login failed', err);
            return of(null);
          })
        )
      )
    );
  }


  /** Validate session / fetch user info */
  /** Validate session / fetch user info using cookies */
  me(): Observable<AdminUser | null> {
    return this.http.get<AdminUser>(`${this.apiUrl}/admin/me`, { withCredentials: true }).pipe(
      tap(user => (this.currentUser = user)),
      catchError(err => {
        console.error('Session invalid', err);
        this.clearAuth();
        return of(null);
      })
    );
  }


  /** Logout from backend + clear client state */
  logout(): Observable<boolean> {
    const headers = this.authHeaders();
    if (!headers) {
      this.clearAuth();
      return of(true); // nothing to do if no token
    }

    return this.http.post(`${this.apiUrl}/logout`, {}, { headers }).pipe(
      tap(() => this.clearAuth()),
      map(() => true),
      catchError(() => {
        this.clearAuth(); // still clear local state if API fails
        return of(true);
      })
    );
  }

  /** Get token string */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Quick check if token exists */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

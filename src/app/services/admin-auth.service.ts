import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
  private authHeaders(): { headers: HttpHeaders } | null {
    const token = this.getToken();
    return token ? { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) } : null;
  }

  /** Login using token-based auth */
  login(credentials: { email: string; password: string }): Observable<AdminUser | null> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => {
        this.setToken(res.access_token);
        this.currentUser = res.user;
      }),
      map(res => res.user),
      catchError(err => {
        console.error('Login failed', err);
        return of(null);
      })
    );
  }

  /** Fetch current admin user using stored token */
  me(): Observable<AdminUser | null> {
    const token = this.getToken();
    if (!token) return of(null);

    return this.http.get<AdminUser>(`${this.apiUrl}/me`, {
      headers: new HttpHeaders({ Authorization: `Bearer ${token}` })
    }).pipe(
      tap(user => this.currentUser = user),
      catchError(err => { this.clearAuth(); return of(null); })
    );
  }



  /** Logout from backend + clear client state */
  logout(): Observable<boolean> {
    const headers = this.authHeaders();
    if (!headers) {
      this.clearAuth();
      return of(true);
    }

    return this.http.post(`${this.apiUrl}/logout`, {}, headers).pipe(
      tap(() => this.clearAuth()),
      map(() => true),
      catchError(() => {
        this.clearAuth();
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

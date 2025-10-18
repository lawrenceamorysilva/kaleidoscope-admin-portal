import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable, of } from 'rxjs';
import { tap, map, catchError } from 'rxjs/operators';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  token?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminAuthService {
  private apiUrl = `${environment.apiUrl}/admin`;
  currentUser: AdminUser | null = null;
  private userLoaded = false; // indicates full user info is loaded

  constructor(private http: HttpClient) {
    // Try to restore token from localStorage on service init
    const token = localStorage.getItem('adminToken');
    if (token) {
      this.currentUser = { token } as AdminUser;
      // fetch full user info from API
      this.init().subscribe();
    }
  }

  /** Initialize full user data */
  init(): Observable<AdminUser | null> {
    const token = this.getToken();
    if (!token) return of(null);

    return this.me();
  }

  /** Fetch currently authenticated admin */
  me(): Observable<AdminUser | null> {
    const token = this.getToken();
    if (!token) return of(null);

    return this.http.get<AdminUser>(`${this.apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(user => {
        this.currentUser = { ...user, token };
        this.userLoaded = true;
      }),
      catchError(() => {
        this.currentUser = null;
        this.userLoaded = false;
        localStorage.removeItem('adminToken');
        return of(null);
      })
    );
  }

  /** Safe getter for token */
  getToken(): string | null {
    return this.currentUser?.token ?? localStorage.getItem('adminToken');
  }

  /** Login using JWT */
  login(credentials: { email: string; password: string }): Observable<AdminUser | null> {
    return this.http.post<{ access_token: string; user?: AdminUser }>(
      `${this.apiUrl}/login`,
      credentials
    ).pipe(
      tap(res => {
        const user: AdminUser = { ...res.user, token: res.access_token } as AdminUser;
        this.currentUser = user;
        localStorage.setItem('adminToken', res.access_token);
      }),
      map(res => ({ ...res.user, token: res.access_token } as AdminUser)),
      catchError(err => {
        console.error('Admin login failed', err);
        return of(null);
      })
    );
  }

  /** Logout admin */
  logout(): Observable<boolean> {
    return this.http.post(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUser = null;
        localStorage.removeItem('adminToken');
        this.userLoaded = false;
      }),
      map(() => true),
      catchError(err => {
        console.error('Logout failed', err);
        this.currentUser = null;
        localStorage.removeItem('adminToken');
        this.userLoaded = false;
        return of(true);
      })
    );
  }

  /** Check if logged in */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Check if full user info has been loaded */
  hasUserLoaded(): boolean {
    return this.userLoaded;
  }
}

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
    const token = localStorage.getItem('adminToken');
    if (token) {
      this.currentUser = { token } as AdminUser;
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
      }),
      map(res => ({ ...res.user, token: res.access_token } as AdminUser)),
      catchError(() => of(null))
    );
  }

  logout(): void {
    this.currentUser = null;
    localStorage.removeItem('adminToken');
    this.loginError$.next('Your session has expired. Please log in again.');
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

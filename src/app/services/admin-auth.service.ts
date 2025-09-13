import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@environments/environment';
import {tap} from 'rxjs';

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

  currentUser: AdminUser | null = null; // <-- simple variable

  constructor(private http: HttpClient) {}

  login(credentials: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(res => {
          localStorage.setItem(this.tokenKey, res.access_token);
          this.currentUser = res.user; // <-- store user here
        })
      );
  }

  me() {
    const token = this.getToken();
    if (!token) return null;

    return this.http.get<AdminUser>(`${this.apiUrl}/me`, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(user => this.currentUser = user) // <-- populate currentUser
    );
  }

  logout() {
    const token = this.getToken();
    return this.http.post(`${this.apiUrl}/logout`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    }).pipe(
      tap(() => {
        localStorage.removeItem(this.tokenKey);
        this.currentUser = null;
      })
    );
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn() {
    return !!this.getToken();
  }
}

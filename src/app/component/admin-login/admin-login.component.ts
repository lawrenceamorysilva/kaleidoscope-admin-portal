import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from '@app/services/admin-auth.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent implements OnInit {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;
  showPassword = false;
  loginMessage: string | null = null;

  constructor(
    private router: Router,
    private adminAuth: AdminAuthService
  ) {}

  ngOnInit(): void {
    // 🧹 Always clear any stale admin session or token when loading login page
    this.adminAuth.logout(true); // force mode

    // Check if redirected from a protected page due to expired/invalid session
    const msg = localStorage.getItem('loginRequiredMessage');
    if (msg) {
      this.error = msg;
      localStorage.removeItem('loginRequiredMessage');
    }

    // Optionally show message if user was logged out due to inactivity
    const expired = localStorage.getItem('sessionExpired');
    if (expired) {
      this.error = 'Your session has expired. Please log in again.';
      localStorage.removeItem('sessionExpired');
    }
  }

  submit(): void {
    this.error = null;

    if (!this.email.trim() || !this.password.trim()) {
      this.error = 'Please enter both email and password.';
      return;
    }

    this.loading = true;

    this.adminAuth.login({ email: this.email.trim(), password: this.password.trim() })
      .subscribe({
        next: (res) => {
          this.loading = false;

          // ✅ Reset any stale flags
          localStorage.removeItem('loginRequiredMessage');
          localStorage.removeItem('sessionExpired');

          // Redirect to intended page or dashboard
          const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/admin';
          localStorage.removeItem('redirectAfterLogin');

          this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
        },
        error: (err) => {
          this.loading = false;

          // Handle known backend errors or fallback
          if (err.status === 401) {
            this.error = 'Invalid email or password.';
          } else if (err.status === 0) {
            this.error = 'Cannot reach the server. Please check your connection.';
          } else {
            this.error = err?.error?.message || 'Login failed. Please try again.';
          }

          // Clear potentially broken token
          this.adminAuth.logout(true);
        }
      });
  }
}

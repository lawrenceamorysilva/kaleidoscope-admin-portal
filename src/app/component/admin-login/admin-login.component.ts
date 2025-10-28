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

  constructor(
    private router: Router,
    private adminAuth: AdminAuthService
  ) {}

  ngOnInit(): void {
    const msg = localStorage.getItem('loginRequiredMessage');
    if (msg) {
      this.error = msg;
      localStorage.removeItem('loginRequiredMessage');
    }

    const expired = localStorage.getItem('sessionExpired');
    if (expired) {
      this.error = '⚠️ Your session has expired. Please log in again.';
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

          if (!res) {
            this.error = 'Invalid login credentials.';
            return;
          }

          // ✅ Clear old flags and redirect
          localStorage.removeItem('loginRequiredMessage');
          localStorage.removeItem('sessionExpired');

          const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
          localStorage.removeItem('redirectAfterLogin');

          const expiry = this.adminAuth.getExpiry();
          console.log(`🔐 Admin login successful — token expires at: ${expiry}`);

          this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Login failed. Please try again.';
        }
      });
  }
}

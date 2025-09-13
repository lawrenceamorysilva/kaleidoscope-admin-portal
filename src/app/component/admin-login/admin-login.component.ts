import { Component } from '@angular/core';
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
export class AdminLoginComponent {
  email = '';
  password = '';
  loading = false;
  error: string | null = null;
  showPassword = false;
  loginMessage: string | null = null; // <-- new

  constructor(
    private router: Router,
    private adminAuth: AdminAuthService
  ) {
    const msg = localStorage.getItem('loginRequiredMessage');
    if (msg) {
      this.error = msg;              // <-- reuse your existing alert
      localStorage.removeItem('loginRequiredMessage');
    }
  }


  submit() {
    this.error = null;
    this.loading = true;

    this.adminAuth.login({ email: this.email, password: this.password })
      .subscribe({
        next: (res) => {
          this.loading = false;

          const redirectUrl = localStorage.getItem('redirectAfterLogin') || '/';
          localStorage.removeItem('redirectAfterLogin');

          this.router.navigateByUrl(redirectUrl, { replaceUrl: true });
        },
        error: (err) => {
          this.loading = false;
          this.error = err?.error?.message || 'Invalid email or password.';
        }
      });
  }
}


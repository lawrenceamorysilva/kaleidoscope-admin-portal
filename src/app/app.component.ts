import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AdminAuthService } from '@app/services/admin-auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'admin-portal';

  constructor(private adminAuth: AdminAuthService, private router: Router) {}

  ngOnInit(): void {
    // Only check token existence on initial load
    if (!this.adminAuth.isLoggedIn()) {
      this.router.navigate(['/login']);
    }
  }
}

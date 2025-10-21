import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '@app/services/admin-auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  sidebarOpen = false;

  constructor(private adminAuthService: AdminAuthService) {}

  get currentUserName() {
    return this.adminAuthService.currentUser?.name || 'Guest';
  }

  closeSidebarOnMobile() {
    if (window.innerWidth <= 992) { // same breakpoint as your CSS
      this.sidebarOpen = false;
    }
  }

  onLogoClick() {
    // Only toggle on mobile (below lg breakpoint)
    if (window.innerWidth < 992) {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }


  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  closeSidebar() {
    this.sidebarOpen = false;
  }

  get currentYear(): number {
    return new Date().getFullYear();
  }

  logout() {
    this.adminAuthService.logout();
    window.location.href = '/login'; // redirect immediately
  }


}

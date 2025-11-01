import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '@app/services/admin-auth.service';
import { DropshipOrderService } from '@app/services/dropship-order.service';
import { interval } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterOutlet],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {
  sidebarOpen = false;
  pendingCount = 0;

  constructor(
    private adminAuthService: AdminAuthService,
    private dropshipOrderService: DropshipOrderService
  ) {}

  ngOnInit(): void {
    this.fetchPendingCount();

    // Auto-refresh every 2 hours
    interval(7200000).subscribe(() => this.fetchPendingCount());

    // 🔹 Listen to refresh triggers
    this.dropshipOrderService.refreshPendingCount$.subscribe(() => {
      this.fetchPendingCount();
    });
  }


  private fetchPendingCount(): void {
    this.dropshipOrderService.getPendingExportCount().subscribe({
      next: (count) => (this.pendingCount = count),
      error: () => (this.pendingCount = 0),
    });
  }

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

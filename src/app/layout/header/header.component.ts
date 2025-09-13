import { Component, Output, EventEmitter } from '@angular/core';
import { RouterModule, Router } from '@angular/router';
import { AdminAuthService } from '@app/services/admin-auth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  navCollapsed = true;

  @Output() toggleSidebar = new EventEmitter<void>();

  constructor(private adminAuthService: AdminAuthService, private router: Router) {

  }

  get currentUserName() {
    return this.adminAuthService.currentUser?.name || 'Guest';
  }

  toggleNav() {
    this.navCollapsed = !this.navCollapsed;
  }

  closeNav() {
    this.navCollapsed = true;
  }

  emitSidebarToggle() {
    this.toggleSidebar.emit();
  }

  logout() {
    this.adminAuthService.logout().subscribe(() => {
      this.router.navigate(['/login'], { replaceUrl: true });
    });
  }


}

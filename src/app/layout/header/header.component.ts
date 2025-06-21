import { Component, Output, EventEmitter } from '@angular/core';
import { RouterModule } from '@angular/router';

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

  toggleNav() {
    this.navCollapsed = !this.navCollapsed;
  }

  closeNav() {
    this.navCollapsed = true;
  }

  emitSidebarToggle() {
    console.log('KIWI!!!');
    this.toggleSidebar.emit();
  }

  //  @Output() toggleSidebar = new EventEmitter<void>();
}

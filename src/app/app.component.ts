import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layout/header/header.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';

@Component({
  selector: 'app-root',
  standalone: true, // ✅ This line is missing!
  imports: [RouterOutlet, HeaderComponent, SidebarComponent], // ✅ Also include RouterOutlet!
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'], // typo was styleUrl → styleUrls
})
export class AppComponent {
  title = 'admin-portal';
}

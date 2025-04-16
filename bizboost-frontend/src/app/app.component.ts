import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    setInterval(() => {
      if (!this.authService.isLoggedIn()) {
        this.authService.logout();
      }
    }, 5000); // Check every 5 seconds
  }
}

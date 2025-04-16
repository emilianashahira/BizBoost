import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';

declare var bootstrap: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  userData = { name: '', email: '', password: '', role: 'visitor' };
  errorMessage: string = '';

  @ViewChild('toastRef', { static: true }) toastRef!: ElementRef;
  @ViewChild('toastMessage', { static: true }) toastMessage!: ElementRef;

  constructor(private authService: AuthService, private router: Router) {}

  register(): void {
    this.authService.register(this.userData).subscribe({
      next: () => {
        this.toastMessage.nativeElement.textContent = '🎉 Registration successful!';
        const toast = new bootstrap.Toast(this.toastRef.nativeElement);
        toast.show();

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage = error.error.message || 'Registration failed. Try again.';
      }
    });
  }
}

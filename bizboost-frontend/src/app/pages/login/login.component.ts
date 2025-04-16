import { Component, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';

declare var bootstrap: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  credentials = { email: '', password: '' };
  errorMessage: string = '';
  previousUrl: string | null = null;

  // Toast references
  @ViewChild('toastRef', { static: true }) toastRef!: ElementRef;
  @ViewChild('toastMessage', { static: true }) toastMessage!: ElementRef;

  constructor(private authService: AuthService, private router: Router) {
    const storedPreviousUrl = localStorage.getItem('previousUrl');
    if (storedPreviousUrl) {
      this.previousUrl = storedPreviousUrl;
      localStorage.removeItem('previousUrl');
    }
  }

  login(): void {
    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('role', response.role);
  
        // ✅ Show success toast
        this.toastMessage.nativeElement.textContent = '✅ Login successful!';
        const toast = new bootstrap.Toast(this.toastRef.nativeElement);
        toast.show();
  
        // 🔁 Redirect based on role
        setTimeout(() => {
          if (response.role === 'admin') {
            this.router.navigate(['/admin-dashboard']);
          } else if (response.role === 'owner') {
            this.router.navigate(['/owner-dashboard']);
          } else {
            this.router.navigate([this.previousUrl || '/']);
          }
        }, 1000);
      },
      error: (err) => {
        if (err.error?.error === 'Your account has been blocked') {
          this.errorMessage = '🚫 Your account has been blocked.';
        } else if (err.error?.error === 'Your business is still pending approval. You cannot log in yet.') {
          this.errorMessage = '⏳ Your business is still pending approval.';
        } else if (err.error?.error === 'Invalid credentials') {
          this.errorMessage = '❌ Invalid email or password.';
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }
    });
  }
  
}

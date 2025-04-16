import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, FormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  resetForm!: FormGroup;
  token: string = '';
  isSuccess: boolean = false;
  isError: boolean = false;
  message: string = '';

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') || '';

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.resetForm.invalid) return;

    const password = this.resetForm.value.password;

    this.http.post(`http://localhost:5000/api/auth/reset-password/${this.token}`, { password }).subscribe({
      next: () => {
        this.isSuccess = true;
        this.message = '✅ Your password has been successfully reset.';
        setTimeout(() => this.router.navigate(['/login']), 3000);
      },
      error: () => {
        this.isError = true;
        this.message = '❌ Invalid or expired token.';
      }
    });
  }
}

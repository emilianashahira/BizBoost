import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.css']
})
export class RatingComponent implements OnInit {
  @Input() businessId!: number;
  @Output() ratingUpdated = new EventEmitter<void>();

  rating: number = 0;
  userRating: number = 0;
  hoverRating: number = 0;

  @ViewChild('ratingToast') ratingToast!: ElementRef;

  constructor(
    private http: HttpClient,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRatings();
  }

  async loadRatings(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.http.get<{ averageRating: number }>(`http://localhost:5000/api/ratings/${this.businessId}`)
      );
      this.rating = response.averageRating || 0;
    } catch (err) {
      console.error("Failed to load rating", err);
    }
  }
  

  setUserRating(star: number): void {
    this.userRating = star;
    this.submitRating();
  }

  submitRating(): void {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.setItem('previousUrl', this.router.url);
      this.router.navigate(['/login']);
      return;
    }

    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    const data = {
      business_id: this.businessId,
      rating: this.userRating
    };

    this.http.post(`http://localhost:5000/api/ratings`, data, { headers }).subscribe({
      next: () => {
        this.loadRatings();
        this.ratingUpdated.emit();
        this.showToast(); // ✅ Show pop-up
      },
      error: (err) => console.error("Failed to submit rating", err)
    });
  }

  showToast(): void {
    const toast = new (window as any).bootstrap.Toast(this.ratingToast.nativeElement);
    toast.show();
  }
}
  

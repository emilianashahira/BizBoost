import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingComponent } from '../../components/rating/rating.component';
import { FeedbackComponent } from '../../components/feedback/feedback.component';
import { Modal } from 'bootstrap';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { firstValueFrom } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NavbarComponent } from '../../components/navbar/navbar.component';




@Component({
  selector: 'app-business-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FeedbackComponent, RatingComponent, NavbarComponent],
  templateUrl: './business-details.component.html',
  styleUrls: ['./business-details.component.css']
})
export class BusinessDetailsComponent implements OnInit {
  business: any;
  images: string[] = [];
  isLoggedIn: boolean = false;
  businessId: string | null = null;
  feedbackList: any[] = [];
  averageRating: number = 0;
  safeMapUrl: SafeResourceUrl | null = null;
  rating: number = 0;
  feedbacks: any[] = [];

  ratings: any[] = [];



  selectedImageIndex: number = 0;
  selectedPreviewImage: string = '';
  showAllFeedback = false;
  showFeedbackList: boolean = true;
  showAllRatings: boolean = false;


  @ViewChild('feedbackToastRef') feedbackToastRef!: ElementRef;
  @ViewChild('ratingToastRef') ratingToastRef!: ElementRef;
  @ViewChild('imagePreviewModal') imagePreviewModal!: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    public authService: AuthService,
    private sanitizer: DomSanitizer,
    private http: HttpClient,
  ) {}

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('id');
    this.isLoggedIn = this.authService.isAuthenticated();

    if (this.businessId) {
      this.loadBusinessDetails();
      this.loadRatings();
      this.fetchFeedback();
      this.fetchRatings(); 
    }
  }

  // Fetch Business Details
  loadBusinessDetails(): void {
    this.businessService.getBusinessById(this.businessId!).subscribe((data) => {
      this.business = data;
      this.images = data.images ? data.images.split(',') : [];
  
      // Generate safe Google Map URL
      const encodedAddress = encodeURIComponent(data.address);
      this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.google.com/maps?q=${encodedAddress}&output=embed`
      );
    });
  }
  
  // Fetch and Format Feedback List
  fetchFeedback(): void {
    this.http.get<any[]>(`http://localhost:5000/api/feedback/${this.businessId}`).subscribe((data) => {
      this.feedbacks = data;
    });
  }
  

  // Fetch Business Rating
  async loadRatings(): Promise<void> {
    try {
      const avgRes = await firstValueFrom(
        this.http.get<{ averageRating: number }>(`http://localhost:5000/api/ratings/${this.businessId}`)
      );
      this.rating = avgRes.averageRating || 0;
  
      const listRes = await firstValueFrom(
        this.http.get<any[]>(`http://localhost:5000/api/ratings/all/${this.businessId}`)
      );
      this.ratings = listRes;
    } catch (err) {
      console.error("Failed to load rating", err);
    }
  }
  
  

  // Refresh Feedback & Ratings on Submission
  refreshData(): void {
    this.fetchFeedback();
    this.loadRatings();
  }

  // Redirect to Login Before Leaving Feedback
  leaveFeedback(): void {
    if (!this.isLoggedIn) {
      localStorage.setItem('previousUrl', `/business/${this.businessId}`);
      this.router.navigate(['/login']);
    }
  }

  openModal(index: number): void {
    this.selectedImageIndex = index;
    const modalElement = document.getElementById('imageModal');
    if (modalElement) {
      const modal = new Modal(modalElement); // ← Now TypeScript knows what this is
      modal.show();
    }
  }  
  openImagePreview(imageUrl: string): void {
    this.selectedPreviewImage = imageUrl;
    const modal = new (window as any).bootstrap.Modal(this.imagePreviewModal.nativeElement);
    modal.show();
  }

  toggleFeedback(): void {
    this.showAllFeedback = !this.showAllFeedback;
  }

  editFeedback(feedback: any): void {
    // Optional: open modal or inline edit
    alert("Editing not yet implemented.");
  } 

  getGoogleMapUrl(): string {
    if (!this.business?.address) return '';
    const encodedAddress = encodeURIComponent(this.business.address);
    return `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  }  

  // Logout
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
  
  deleteFeedback(feedbackId: number): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  
    this.http.delete(`http://localhost:5000/api/feedback/delete/${feedbackId}`, { headers }).subscribe(() => {
      this.fetchFeedback(); // Refresh feedback list
      this.showToast();     // Show toast notification
    });
  }
  
  showToast(): void {
    const toast = new (window as any).bootstrap.Toast(this.feedbackToastRef.nativeElement);
    toast.show();
  }
  

  toggleFeedbackList(): void {
    this.showAllFeedback = !this.showAllFeedback;
  }

  toggleRatingList(): void {
    this.showAllRatings = !this.showAllRatings;
  }
  

  fetchRatings(): void {
    this.http.get<any[]>(`http://localhost:5000/api/ratings/all/${this.businessId}`).subscribe(data => {
      this.ratings = data;
    });
  }

  deleteRating(ratingId: number): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  
    this.http.delete(`http://localhost:5000/api/ratings/delete/${ratingId}`, { headers }).subscribe(() => {
      this.fetchRatings();
      this.showRatingToast();
    });
  }
  
  showRatingToast(): void {
    const toast = new (window as any).bootstrap.Toast(this.ratingToastRef.nativeElement);
    toast.show();
  }
  
}

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { BusinessService } from '../../services/business.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  trigger,
  transition,
  style,
  animate
} from '@angular/animations';


@Component({
  selector: 'app-business-owner-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './business-owner-dashboard.component.html',
  styleUrls: ['./business-owner-dashboard.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-in', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class BusinessOwnerDashboardComponent implements OnInit {
  business: any = null;
  businessImages: string[] = [];
  feedbackList: any[] = [];
  showAllFeedback: boolean = false;
  rating: number = 0;
  totalRatings: number = 0;
  starsArray: number[] = [1, 2, 3, 4, 5];
  safeMapUrl: SafeResourceUrl | null = null;
  mainImagePreviewUrl: string | null = null;

  userRole: string | null = null;
  currentUser: any = null;
  ratingList: any[] = [];
  showAllRatings: boolean = false;


  updatedData: any = {};
  selectedImage: File | null = null;
  selectedMainImage: File | null = null;
  selectedPreviewImage: string = '';
  categoryOptions: string[] = ['Food', 'Apparel'];

  @ViewChild('editModal') editModal!: ElementRef;
  @ViewChild('modalMessage') modalMessage!: ElementRef;
  @ViewChild('alertModal') alertModal!: ElementRef;
  @ViewChild('imagePreviewModal') imagePreviewModal!: ElementRef;
  @ViewChild('toast') toast!: ElementRef;
  @ViewChild('toastMessage') toastMessage!: ElementRef;

  constructor(
    private businessService: BusinessService,
    public authService: AuthService,
    private router: Router,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    
    const ownerId = this.authService.getUserId();
    this.userRole = this.authService.getUserRole();
    this.currentUser = this.authService.getCurrentUser();
  
    if (!ownerId) {
      this.router.navigate(['/login']);
      return;
    }
  
    this.businessService.getBusinessByOwner(ownerId.toString()).subscribe({
      next: (data) => {
        this.business = data[0];
        this.businessImages = this.business.images ? this.business.images.split(',') : [];
        this.fetchAllRatings(this.business.id);
        this.fetchFeedback(this.business.id);
        this.fetchAverageRating(this.business.id);
  
        const encodedAddress = encodeURIComponent(this.business.address);
        this.safeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
          `https://www.google.com/maps?q=${encodedAddress}&output=embed`
        );
      },
      error: () => this.showToast('Failed to fetch business data.')
    });

     // Check if approval message should show
      const approvedNotified = localStorage.getItem('businessApprovedNotified');
      if (!approvedNotified) {
        this.showToast("🎉 Your business has been approved! You're now an Owner.");
        localStorage.setItem('businessApprovedNotified', 'true'); // prevent showing again
      }

  }

  showToast(message: string): void {
    this.toastMessage.nativeElement.textContent = message;
    const toastInstance = new (window as any).bootstrap.Toast(this.toast.nativeElement);
    toastInstance.show();
  }

  openEditModal(): void {
    this.updatedData = { ...this.business };
    const modal = new (window as any).bootstrap.Modal(this.editModal.nativeElement);
    modal.show();
  }

  saveChanges(): void {
    if (this.selectedMainImage) {
      this.businessService.uploadMainImage(this.business.id, this.selectedMainImage).subscribe({
        next: (res) => {
          this.updatedData.main_image = res.imageUrl;
          this.updateBusiness();
        },
        error: () => this.showToast('Failed to upload main image.')
      });
    } else {
      this.updateBusiness();
    }
  }

  updateBusiness(): void {
    this.businessService.updateBusiness(this.business.id, this.updatedData).subscribe({
      next: () => {
        this.business = { ...this.updatedData };
        this.showToast('Business info updated successfully.');
  
  
        (window as any).bootstrap.Modal.getInstance(this.editModal.nativeElement).hide();
      },
      error: () => this.showToast('Failed to update business info.')
    });
  }

  onImageSelected(event: any): void {
    this.selectedImage = event.target.files[0];
    if (this.selectedImage) {
      console.log('Image selected:', this.selectedImage.name);
    }
  }
  

  onMainImageSelected(event: any): void {
    this.selectedMainImage = event.target.files[0];
    if (this.selectedMainImage) {
      const reader = new FileReader();
      reader.onload = () => {
        this.mainImagePreviewUrl = reader.result as string;
      };
      reader.readAsDataURL(this.selectedMainImage);
    }
  }

  uploadImage(): void {
    if (!this.selectedImage || !this.business?.id) {
      this.showToast('No image selected or business ID missing.');
      return;
    }
  
    console.log('Uploading image:', this.selectedImage.name);
  
    this.businessService.uploadBusinessImage(this.business.id, this.selectedImage).subscribe({
      next: (res) => {
        this.businessImages.push(res.imageUrl);
        this.selectedImage = null;
        this.showToast('Image uploaded successfully.');
      },
      error: () => this.showToast('Failed to upload image.')
    });
  }
  

  deleteImage(imageUrl: string): void {
    if (!this.business?.id) return;

    this.businessService.deleteBusinessImage(this.business.id, imageUrl).subscribe({
      next: () => {
        this.businessImages = this.businessImages.filter(img => img !== imageUrl);
        this.showToast('Image deleted successfully.');
      },
      error: () => this.showToast('Failed to delete image.')
    });
  }

  fetchAverageRating(businessId: string): void {
    this.businessService.getAverageRating(businessId).subscribe({
      next: (res) => {
        this.rating = res.averageRating || 0;
        this.totalRatings = res.totalRatings || 0;
      },
      error: () => this.showToast('Failed to fetch average rating.')
    });
  }

  openImagePreview(imageUrl: string): void {
    this.selectedPreviewImage = imageUrl;
    const modal = new (window as any).bootstrap.Modal(this.imagePreviewModal.nativeElement);
    modal.show();
  }

  showModal(message: string): void {
    this.modalMessage.nativeElement.textContent = message;
    const modal = new (window as any).bootstrap.Modal(this.alertModal.nativeElement);
    modal.show();
  }

  getGoogleMapUrl(): string {
    if (!this.business?.address) return '';
    const encodedAddress = encodeURIComponent(this.business.address);
    return `https://www.google.com/maps?q=${encodedAddress}&output=embed`;
  }  

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  fetchAllRatings(businessId: string): void {
    this.businessService.getAllRatings(businessId).subscribe({
      next: (res) => {
        this.ratingList = res;
      },
      error: () => this.showToast('Failed to load ratings.')
    });
  }
  
  fetchFeedback(businessId: string): void {
    this.businessService.getFeedback(businessId.toString()).subscribe({
      next: (data) => {
        this.feedbackList = data;
      },
      error: () => this.showToast('Failed to load feedback.')
    });
  }
  
  toggleRatingList(): void {
    this.showAllRatings = !this.showAllRatings;
  }
  
  toggleFeedbackList(): void {
    this.showAllFeedback = !this.showAllFeedback;
  }
  
  
  
}

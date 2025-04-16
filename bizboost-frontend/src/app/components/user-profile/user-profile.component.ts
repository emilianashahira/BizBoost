import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { BusinessService } from '../../services/business.service';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NavbarComponent],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit, AfterViewInit {
  user: any = {};
  updatedUser: any = {};
  selectedPhoto: File | null = null;
  previewUrl: string | null = null;
  viewReady = false;
  userRole: string | null = null;
  showNavbar: boolean = false;

  userBusiness: any = null; 


  @ViewChild('editProfileModal') editProfileModal!: ElementRef;
  @ViewChild('toast') toast!: ElementRef;
  @ViewChild('toastMessage') toastMessage!: ElementRef;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private businessService: BusinessService
  ) {}
  

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    this.userRole = this.authService.getUserRole();
    this.showNavbar = this.userRole === 'visitor';
  
    if (!userId) return;
  
    this.authService.getUserDetails(userId).subscribe({
      next: (data) => {
        this.user = data;
        this.updatedUser = { ...data };
  
        // 🔽 Only fetch business if user is a visitor
        if (this.user.role === 'visitor') {
          this.businessService.getBusinessByOwner(userId.toString()).subscribe({
            next: (businesses) => {
              this.userBusiness = businesses[0]; // Assume 1 business per user
            },
            error: (err) => {
              if (err.status !== 404) {
                this.showToast('Failed to fetch business info.');
              }
              // 404 means no business found — do nothing
            }
          });
        }
      },
      error: () => this.showToast('Failed to load user data.')
    });
  }
  
  

  ngAfterViewInit(): void {
    this.viewReady = true;
  }

  onPhotoSelected(event: any): void {
    this.selectedPhoto = event.target.files[0];
    if (this.selectedPhoto) {
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(this.selectedPhoto);
    }
  }

  uploadPhoto(): void {
    const userId = this.authService.getUserId();
    if (!this.selectedPhoto || !userId) return;

    this.authService.uploadProfilePhoto(userId, this.selectedPhoto).subscribe({
      next: (res) => {
        this.user.profile_photo = res.imageUrl;
        this.updatedUser.profile_photo = res.imageUrl;
        this.selectedPhoto = null;
        this.previewUrl = null;
        this.showToast('Profile photo uploaded successfully.');
      },
      error: () => this.showToast('Failed to upload profile photo.')
    });
  }

  saveChanges(): void {
    const userId = this.authService.getUserId();
    if (!userId) return;

    const updateAndToast = () => {
      this.authService.updateUser(userId, this.updatedUser).subscribe({
        next: () => {
          this.user = { ...this.updatedUser };
          this.closeEditModal();
          this.showToast('Profile updated successfully.');
        },
        error: () => this.showToast('Failed to update profile.')
      });
    };

    if (this.selectedPhoto) {
      this.authService.uploadProfilePhoto(userId, this.selectedPhoto).subscribe({
        next: (res) => {
          this.updatedUser.profile_photo = res.imageUrl;
          this.user.profile_photo = res.imageUrl;
          this.selectedPhoto = null;
          this.previewUrl = null;
          updateAndToast();
        },
        error: () => this.showToast('Failed to upload profile photo.')
      });
    } else {
      updateAndToast();
    }
  }

  openEditModal(): void {
    if (!this.viewReady) return;
    new (window as any).bootstrap.Modal(this.editProfileModal.nativeElement).show();
  }

  closeEditModal(): void {
    if (!this.viewReady) return;
    const modalInstance = (window as any).bootstrap.Modal.getInstance(this.editProfileModal.nativeElement);
    if (modalInstance) {
      modalInstance.hide();
    }
  }

  showToast(message: string): void {
    if (!this.viewReady) return;
    this.toastMessage.nativeElement.textContent = message;
    const toast = new (window as any).bootstrap.Toast(this.toast.nativeElement);
    toast.show();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

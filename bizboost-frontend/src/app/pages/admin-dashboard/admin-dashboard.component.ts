import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

declare var bootstrap: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  businesses: any[] = [];
  pendingBusinesses: any[] = [];
  approvedBusinesses: any[] = [];
  deactivatedBusinesses: any[] = [];
  users: any[] = [];
  feedbacks: any[] = [];
  ratings: any[] = [];
  userRole: string | null = null;
  currentUser: any = null;

  selectedBusiness: any = null;
  selectedUser: any = null;

  currentTab: string = 'approved';

  searchPending: string = '';
  searchApproved: string = '';
  searchDeactivated: string = '';

  itemsPerPage: number = 5;
  currentPage = {
    pending: 1,
    approved: 1,
    deactivated: 1
  };

  businessToDeleteId: number | null = null;
  ratingToDeleteId: number | null = null;
  feedbackToDeleteId: number | null = null;
  userToDeleteId: number | null = null;

  @ViewChild('toastRef') toastRef!: ElementRef;
  @ViewChild('toastMessage') toastMessage!: ElementRef;
  @ViewChild('detailsModal') detailsModal!: ElementRef;
  @ViewChild('confirmDeleteModal') confirmDeleteModal!: ElementRef;
  @ViewChild('toastContainer') toastContainer!: ElementRef;
  @ViewChild('confirmRatingDeleteModal') confirmRatingDeleteModal!: ElementRef;
  @ViewChild('confirmFeedbackDeleteModal') confirmFeedbackDeleteModal!: ElementRef;
  @ViewChild('confirmUserDeleteModal') confirmUserDeleteModal!: ElementRef;



  constructor(
    private adminService: AdminService,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.fetchBusinesses();
    this.fetchUsers();
    this.fetchFeedbacks();
    this.fetchRatings(); 
    this.userRole = this.authService.getUserRole();
    this.currentUser = this.authService.getCurrentUser();
  }

  fetchBusinesses(): void {
    this.adminService.getBusinessesByStatus('pending').subscribe(data => this.pendingBusinesses = data);
    this.adminService.getBusinessesByStatus('approved').subscribe(data => this.approvedBusinesses = data);
    this.adminService.getBusinessesByStatus('deactivated').subscribe(data => this.deactivatedBusinesses = data);
  }

  getBusinessesByTab(tab: string): any[] {
    if (tab === 'pending') return this.pendingBusinesses;
    if (tab === 'approved') return this.approvedBusinesses;
    if (tab === 'deactivated') return this.deactivatedBusinesses;
    return [];
  }

  showToast(message: string): void {
    this.toastMessage.nativeElement.textContent = message;
    const toastEl = new bootstrap.Toast(this.toastRef.nativeElement);
    toastEl.show();
  }

  viewDetails(business: any): void {
    this.selectedBusiness = business;
    this.selectedUser = business.owner;
    const modal = new bootstrap.Modal(this.detailsModal.nativeElement);
    modal.show();
  }

  paginate(array: any[], page: number, search: string): any[] {
    const filtered = array.filter(item => item.name.toLowerCase().includes(search.toLowerCase()));
    const start = (page - 1) * this.itemsPerPage;
    return filtered.slice(start, start + this.itemsPerPage);
  }

  approveBusiness(business: any): void {
    this.adminService.approveBusiness(business.id, business.owner.id).subscribe(() => {
      this.showToast('Business approved!');
      this.fetchBusinesses();
    });
  }

  deactivateBusiness(businessId: number): void {
    this.adminService.deactivateBusiness(businessId).subscribe(() => {
      this.showToast('Business deactivated');
      this.fetchBusinesses();
    });
  }

  activateBusiness(businessId: number): void {
    this.adminService.activateBusiness(businessId).subscribe(() => {
      this.showToast('Business activated');
      this.fetchBusinesses();
    });
  }

  deleteBusiness(id: number): void {
    this.businessToDeleteId = id;
    const modal = new bootstrap.Modal(this.confirmDeleteModal.nativeElement);
    modal.show();
  }

  confirmDelete(): void {
    if (!this.businessToDeleteId) return;

    this.adminService.deleteBusiness(this.businessToDeleteId).subscribe(() => {
      this.showToast('Business deleted, user role updated to visitor.');
      this.fetchBusinesses();
      this.businessToDeleteId = null;

      // ✅ Close the modal programmatically after successful deletion
      const modalInstance = bootstrap.Modal.getInstance(this.confirmDeleteModal.nativeElement);
      if (modalInstance) {
        modalInstance.hide();
      }
    });
  }

  fetchUsers(): void {
    this.adminService.getAllUsers().subscribe(data => this.users = data);
  }

  fetchFeedbacks(): void {
    this.adminService.getAllFeedback().subscribe(data => this.feedbacks = data);
  }

  fetchRatings(): void {
    this.adminService.getAllRatings().subscribe(data => this.ratings = data);
  }

  getTotalBusinesses(): number {
    return (this.pendingBusinesses?.length || 0) +
           (this.approvedBusinesses?.length || 0) +
           (this.deactivatedBusinesses?.length || 0);
  }

  switchTab(tabId: string): void {
    const trigger = document.querySelector(`a.nav-link[href="#${tabId}"]`) as HTMLElement;
    if (trigger) {
      trigger.click();
      document.getElementById(tabId)?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  getTodayBusinessCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.pendingBusinesses.filter(b => b.created_at?.startsWith(today)).length;
  }

  getTodayUsersCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.users.filter(u => u.created_at?.startsWith(today)).length;
  }

  getTodayFeedbackCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.feedbacks.filter(f => f.created_at?.startsWith(today)).length;
  }

  getTodayRatingCount(): number {
    const today = new Date().toISOString().split('T')[0];
    return this.ratings.filter(r => r.created_at?.startsWith(today)).length;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  deleteRating(ratingId: number): void {
    this.ratingToDeleteId = ratingId;
    const modal = new bootstrap.Modal(this.confirmRatingDeleteModal.nativeElement);
    modal.show();
  }

  confirmDeleteRating(): void {
    if (!this.ratingToDeleteId) return;
  
    this.adminService.deleteRating(this.ratingToDeleteId).subscribe(() => {
      this.showToast('Rating deleted successfully');
      this.fetchRatings();
      this.ratingToDeleteId = null;
  
      const modalInstance = bootstrap.Modal.getInstance(this.confirmRatingDeleteModal.nativeElement);
      if (modalInstance) modalInstance.hide();
    });
  }

  deleteFeedback(feedbackId: number): void {
    this.feedbackToDeleteId = feedbackId;
    const modal = new bootstrap.Modal(this.confirmFeedbackDeleteModal.nativeElement);
    modal.show();
  }

  confirmDeleteFeedback(): void {
    if (!this.feedbackToDeleteId) return;
  
    this.adminService.deleteFeedback(this.feedbackToDeleteId).subscribe(() => {
      this.showToast('Feedback deleted successfully');
      this.fetchFeedbacks();
      this.feedbackToDeleteId = null;
  
      const modalInstance = bootstrap.Modal.getInstance(this.confirmFeedbackDeleteModal.nativeElement);
      if (modalInstance) modalInstance.hide();
    });
  }

  deleteUser(userId: number): void {
    this.userToDeleteId = userId;
    const modal = new bootstrap.Modal(this.confirmUserDeleteModal.nativeElement);
    modal.show();
  }

  confirmDeleteUser(): void {
    if (!this.userToDeleteId) return;
  
    this.adminService.deleteUser(this.userToDeleteId).subscribe(() => {
      this.showToast('User deleted successfully');
      this.fetchUsers();
      this.userToDeleteId = null;
  
      const modalInstance = bootstrap.Modal.getInstance(this.confirmUserDeleteModal.nativeElement);
      if (modalInstance) modalInstance.hide();
    });
  }
  
  toggleUserStatus(user: any): void {
    const newStatus = user.status === 'Active' ? 'Deactive' : 'Active';
    this.adminService.updateUserStatus(user.id, newStatus).subscribe(() => {
      this.showToast(`User status updated to ${newStatus}`);
      this.fetchUsers();
    });
  }
  
  
}

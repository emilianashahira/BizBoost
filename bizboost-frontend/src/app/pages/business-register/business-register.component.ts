import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import bootstrap from 'bootstrap';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-business-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './business-register.component.html',
  styleUrls: ['./business-register.component.css']
})
export class BusinessRegisterComponent implements OnInit {
  @ViewChild('alertModal') alertModal!: ElementRef;
  @ViewChild('modalMessage') modalMessage!: ElementRef;

  businessData = {
    name: '',
    category: '',
    location: '',
    address: '',
    description: '',
    contact: '',
    hours_operation: '',
    price_range: '',
    ownerId: null as number | null,
  };

  constructor(
    private businessService: BusinessService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.authService.getUserId();
    if (!userId) {
      this.showModal("You must be logged in to register a business.");
      this.router.navigate(['/login']);
      return;
    }

    // 🔁 Check if this user already has a business
    this.businessService.getBusinessByOwner(userId.toString()).subscribe({
      next: (business) => {
        if (business.status === 'pending') {
          this.showModal("You have registered a business. Please wait for approval.");
        } else {
          this.showModal("You already have registered a business.");
        }

        // ⛔ Prevent further registration
        setTimeout(() => this.router.navigate(['/businesses']), 2000);
      },
      error: (err) => {
        if (err.status === 404) {
          // ✅ No business found, allow form submission
        } else {
          this.showModal("Failed to check existing business.");
        }
      }
    });
  }

  registerBusiness(): void {
    const { name, category, location, address, description, contact, hours_operation, price_range } = this.businessData;
    const userId = this.authService.getUserId();

    if (!userId || !name || !category || !location || !address || !description || !contact || !hours_operation || !price_range) {
      this.showModal('Please fill in all fields.');
      return;
    }

    this.businessData.ownerId = userId;

    this.businessService.registerBusiness(this.businessData).subscribe({
      next: () => {
        this.showModal('Your business has been submitted for approval.');
        this.alertModal.nativeElement.addEventListener('hidden.bs.modal', () => {
          this.router.navigate(['/profile']);
        });        
      },
      error: () => {
        this.showModal('Registration failed. Please try again.');
      }
    });    
  }

  showModal(message: string): void {
    this.modalMessage.nativeElement.textContent = message;
    const modalInstance = new (window as any).bootstrap.Modal(this.alertModal.nativeElement);
    modalInstance.show();
  }
}

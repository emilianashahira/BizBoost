import { Component, OnInit } from '@angular/core';
import { BusinessService } from '../../services/business.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../../components/navbar/navbar.component';

@Component({
  selector: 'app-business-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './business-list.component.html',
  styleUrls: ['./business-list.component.css']
})
export class BusinessListComponent implements OnInit {
  businesses: any[] = [];
  filteredBusinesses: any[] = [];
  searchTerm: string = '';
  selectedCategory: string = '';
  selectedLocation: string = '';
  searchQuery: string = '';

  showBanner = true;
  isFadingOut = false;

  categories: string[] = ['Food', 'Apparel']; 
  locations: string[] = ['Kuala Lumpur', 'Petaling Jaya' ]; 

  loading: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 6;

  constructor(private businessService: BusinessService) {}

  ngOnInit(): void {
    this.fetchBusinesses();
    this.fetchLocations();

    setTimeout(() => {
      this.showBanner = false;
    }, 4000); // Hide after 4 seconds
  }

  fetchBusinesses(): void {
    this.loading = true;
    this.businessService.getBusinesses(this.searchQuery, this.selectedCategory, this.selectedLocation)
      .subscribe((data) => {
        this.businesses = data;
        this.currentPage = 1; 
        this.loading = false;
      }, error => {
        this.loading = false;
      });
  }
  

  onSearch(): void {
    console.log("Search Query:", this.searchQuery);
    console.log("Selected Category:", this.selectedCategory);
    console.log("Selected Location:", this.selectedLocation);
    this.fetchBusinesses();
  }

  filterBusinesses(): void {
    this.filteredBusinesses = this.businesses.filter(business => 
      (this.searchTerm ? business.name.toLowerCase().includes(this.searchTerm.toLowerCase()) : true) &&
      (this.selectedCategory ? business.category === this.selectedCategory : true) &&
      (this.selectedLocation ? business.location.toLowerCase().includes(this.selectedLocation.toLowerCase()) : true)
    );
  }

  fetchLocations(): void {
    this.businessService.getBusinessLocations().subscribe((data) => {
      this.locations = data.sort((a, b) => a.localeCompare(b)); // Sort locations A-Z
    });
  }

  get paginatedBusinesses(): any[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.businesses.slice(start, start + this.itemsPerPage);
  }
  
  get totalPages(): number {
    return Math.ceil(this.businesses.length / this.itemsPerPage);
  }
  
  changePage(page: number): void {
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' }); // optional scroll
  }

  
  startExploring() {
    this.isFadingOut = true;
  
    // Wait for the animation to complete (1s)
    setTimeout(() => {
      this.showBanner = false;
    }, 1000);
  }
  
  
}

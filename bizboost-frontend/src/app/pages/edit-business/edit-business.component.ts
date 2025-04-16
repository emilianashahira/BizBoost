import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BusinessService } from '../../services/business.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-edit-business',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-business.component.html',
  styleUrls: ['./edit-business.component.css']
})
export class EditBusinessComponent implements OnInit {
  editForm!: FormGroup;
  businessId!: string;
  selectedFile!: File;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private businessService: BusinessService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.businessId = this.route.snapshot.paramMap.get('id') ?? '';

    // Initialize Form
    this.editForm = this.fb.group({
      name: [''],
      category: [''],
      location: [''],
      contact: [''],
      description: ['']
    });

    // Fetch Business Details
    if (this.businessId) {
      this.businessService.getBusinessById(this.businessId).subscribe((data) => {
        this.editForm.patchValue(data); // Fill form with existing values
      });
    }
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      this.businessService.updateBusiness(this.businessId, this.editForm.value).subscribe(() => {
        alert('Business updated successfully!');
        this.router.navigate(['/owner-dashboard']);
      });
    }
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }
  
  uploadImage() {
    if (this.selectedFile) {
      this.businessService.uploadBusinessImage(this.businessId, this.selectedFile).subscribe(response => {
        alert('Image uploaded successfully!');
      });
    }
  }
}

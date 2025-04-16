import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-feedback',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit {
  @Input() businessId!: number;
  @Output() feedbackUpdated = new EventEmitter<void>();

  feedbackText: string = '';
  feedbacks: any[] = [];
  showAllFeedback: boolean = false;

  constructor(private http: HttpClient, public authService: AuthService) {}

  ngOnInit(): void {
    if (this.businessId) {
      this.fetchFeedback();
    }
  }

  submitFeedback(): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
  
    const data = {
      business_id: this.businessId,
      feedback: this.feedbackText
    };
  
    this.http.post(`http://localhost:5000/api/feedback`, data, { headers }).subscribe(() => {
      this.feedbackText = '';
      this.fetchFeedback();
      this.feedbackUpdated.emit();
      this.showToast();
    });
  }
  

  fetchFeedback(): void {
    this.http.get<any[]>(`http://localhost:5000/api/feedback/${this.businessId}`).subscribe((data) => {
      this.feedbacks = data;
    });
  }

  deleteFeedback(feedbackId: number): void {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

    this.http.delete(`http://localhost:5000/api/feedback/delete/${feedbackId}`, { headers }).subscribe(() => {
      this.fetchFeedback();
      this.feedbackUpdated.emit();
    });
  }

  showToast(): void {
    const toastEl = document.getElementById('feedbackToast');
    if (toastEl) {
      const toast = new (window as any).bootstrap.Toast(toastEl);
      toast.show();
    }
  }
  

  toggleFeedbackList(): void {
    this.showAllFeedback = !this.showAllFeedback;
  }
  
}

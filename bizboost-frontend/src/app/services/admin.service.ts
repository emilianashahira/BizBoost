import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private baseUrl = 'http://localhost:5000/api/admin';

  constructor(private http: HttpClient) {}

  // 🔐 Helper: Get Auth Header
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token') || '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // ✅ Get All Businesses (with owner info)
  getAllBusinesses(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/businesses`, {
      headers: this.getAuthHeaders()
    });
  }

  getBusinessesByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/businesses/status/${status}`, {
      headers: this.getAuthHeaders()
    });
  }  
  

  // ✅ Approve Pending Business + Update Role
  approveBusiness(businessId: number, userId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/approve/${businessId}`, { user_id: userId }, {
      headers: this.getAuthHeaders()
    });
  }  

  // ✅ Activate Business
  activateBusiness(businessId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/business/activate/${businessId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Deactivate Business
  deactivateBusiness(businessId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/business/deactivate/${businessId}`, {}, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Delete Business
  deleteBusiness(businessId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/business/${businessId}`, {
      headers: this.getAuthHeaders()
    });
  }  

  // ✅ Get All Users
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Update User
  updateUserStatus(userId: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/user/status/${userId}`, { status }, {
      headers: this.getAuthHeaders()
    });
  }
  

  // ✅ Delete User
  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/user/${userId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Get All Feedback
  getAllFeedback(): Observable<any> {
    return this.http.get(`${this.baseUrl}/feedback`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Delete Feedback
  deleteFeedback(feedbackId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/feedback/${feedbackId}`, {
      headers: this.getAuthHeaders()
    });
  }

  // ✅ Get All Ratings
  getAllRatings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/ratings`, {
      headers: this.getAuthHeaders()
    });
  }
  
  deleteRating(ratingId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/ratings/${ratingId}`, {
      headers: this.getAuthHeaders()
    });
  }
  
}

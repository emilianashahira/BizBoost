import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BusinessService {
  private apiUrl = 'http://localhost:5000/api/businesses';

  constructor(private http: HttpClient) {}

  getBusinesses(search: string = '', category: string = '', location: string = ''): Observable<any> {
    let queryParams = `?search=${search}&category=${category}&location=${location}`;
    return this.http.get<any>(`${this.apiUrl}${queryParams}`);
  }

  getBusinessByOwner(ownerId: string | null): Observable<any> {
    if (!ownerId) throw new Error("Invalid owner ID");
    return this.http.get(`${this.apiUrl}/owner/${ownerId}`);
  }

  getBusinessById(businessId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${businessId}`);
  }

  updateBusiness(businessId: string, businessData: any): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.put(`${this.apiUrl}/${businessId}`, businessData, { headers });
  }

  uploadMainImage(businessId: string, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post(`${this.apiUrl}/upload-main-image/${businessId}`, formData);
  }

  uploadBusinessImage(businessId: string, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post(`${this.apiUrl}/upload/${businessId}`, formData);
  }

  deleteBusinessImage(businessId: string, imagePath: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`${this.apiUrl}/delete-image/${businessId}`, {
      headers,
      body: { imagePath }
    });
  }  

  getBusinessLocations(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/locations`);
  }

  getFeedback(businessId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:5000/api/feedback/${businessId}`);
  }

  getAverageRating(businessId: string): Observable<any> {
    return this.http.get<any>(`http://localhost:5000/api/ratings/${businessId}`);
  }
  

  registerBusiness(businessData: any): Observable<any> {
    return this.http.post(`http://localhost:5000/api/auth/register-business`, businessData);
  }

  deleteFeedback(feedbackId: number): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete(`http://localhost:5000/api/feedback/delete/${feedbackId}`, { headers });
  }
  
  getRatings(businessId: string): Observable<any[]> {
    return this.http.get<any[]>(`/api/ratings/${businessId}`);
  }

  getAllRatings(businessId: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5000/api/ratings/all/${businessId}`);
  }
  

  
}

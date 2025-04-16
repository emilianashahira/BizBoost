import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:5000/api/auth';

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('role');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    // Check if token is expired
    const tokenPayload = JSON.parse(atob(token.split('.')[1])); // Decode JWT
    const expiryTime = tokenPayload.exp * 1000; // Convert to milliseconds

    if (Date.now() >= expiryTime) {
      this.logout(); // Expired token? Log out the user
      return false;
    }

    return true;
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token'); // ✅ Check if token exists
  }

  getUserId(): number | null {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id || null;
  }

  getUserDetails(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${id}`);
  }

  updateUser(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/user/${id}`, data);
  }

  uploadProfilePhoto(id: number, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', image);
    return this.http.post(`${this.apiUrl}/upload-profile/${id}`, formData);
  }

  getCurrentUser(): any {
    const token = localStorage.getItem('token');
    if (!token) return null;
  
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
  
      return {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        profile_photo: payload.profile_photo || null
      };
    } catch (error) {
      console.error('Failed to decode token:', error);
      return null;
    }
  }
  

  
}

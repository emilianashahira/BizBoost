import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const userRole = this.authService.getUserRole(); // Get role from localStorage
    const allowedRoles = route.data['roles']; // Get allowed roles from route

    if (this.authService.isLoggedIn() && allowedRoles.includes(userRole)) {
      return true; // ✅ Allow access
    } else {
      this.router.navigate(['/login']); // ❌ Redirect if unauthorized
      return false;
    }
  }
}

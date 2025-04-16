import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BusinessListComponent } from './pages/business-list/business-list.component';
import { BusinessDetailsComponent } from './pages/business-details/business-details.component';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { AdminComponent } from './pages/admin/admin.component';
import { AuthGuard } from './guards/auth.guard';
import { BusinessOwnerDashboardComponent } from './pages/business-owner-dashboard/business-owner-dashboard.component';
import { EditBusinessComponent } from './pages/edit-business/edit-business.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';
import { BusinessRegisterComponent } from './pages/business-register/business-register.component';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';


const routes: Routes = [
  { path: '', redirectTo: 'businesses', pathMatch: 'full' },
  { path: 'businesses', component: BusinessListComponent },
  { path: 'business/:id', component: BusinessDetailsComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'admin', component: AdminComponent, canActivate: [AuthGuard] },
  { path: 'edit-business/:id', component: EditBusinessComponent, canActivate: [AuthGuard] },
  { path: 'business-register', component: BusinessRegisterComponent},
  { path: 'profile', component: UserProfileComponent},
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },

  {
    path: 'admin-dashboard',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['admin'] } //Only admins can access
  },
  {
    path: 'owner-dashboard',
    component: BusinessOwnerDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['owner'] } // ✅ Only business owners can access
  },
 
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

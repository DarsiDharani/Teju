/**
 * Angular Application Routing Module
 * 
 * Purpose: Defines application routes and navigation configuration
 * Features:
 * - Configures all application routes
 * - Applies AuthGuard to protected routes (dashboards)
 * - Sets up default route redirection
 * 
 * Routes:
 * - /: Redirects to /home
 * - /home: Landing page
 * - /login: User login page
 * - /register: User registration page
 * - /about: About page
 * - /engineer-dashboard: Engineer dashboard (protected)
 * - /manager-dashboard: Manager dashboard (protected)
 * 
 * @author Orbit Skill Development Team
 * @date 2025
 */

// Core Angular routing modules
import { NgModule } from '@angular/core';  // NgModule decorator for defining modules
import { RouterModule, Routes } from '@angular/router';  // Router and Routes for navigation configuration

// Public components (accessible without authentication)
import { AboutComponent } from './components/about/about.component';  // About/information page
import { HomeComponent } from './components/home/home.component';  // Landing page
import { LoginComponent } from './components/login/login.component';  // User login form
import { RegisterComponent } from './components/register/register.component';  // New user registration

// Protected components (require authentication via AuthGuard)
import { EngineerDashboardComponent } from './dashboards/engineer-dashboard/engineer-dashboard.component';  // Employee view
import { ManagerDashboardComponent } from './dashboards/manager-dashboard/manager-dashboard.component';  // Manager view
import { AdminDashboardComponent } from './dashboards/admin-dashboard/admin-dashboard.component';  // Admin view

// Route guards for access control
import { AuthGuard } from './guards/auth.guard';  // Protects routes requiring authentication

/**
 * Application routes configuration
 * Each route maps a URL path to a component and optionally applies guards
 * 
 * Route Structure:
 * - path: URL segment (e.g., 'login' maps to /login)
 * - component: Component to display for this route
 * - canActivate: Array of guards that must pass before route activates
 * - redirectTo: Redirect to another route
 * - pathMatch: How to match URL (full = exact match)
 */
const routes: Routes = [
  // Default route: Redirect root URL (/) to /home
  // pathMatch: 'full' ensures only exact match redirects (not partial matches)
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  
  // Public routes: Accessible to all users without authentication
  { path: 'home', component: HomeComponent },              // Landing page with app overview
  { path: 'login', component: LoginComponent },            // User authentication page
  { path: 'register', component: RegisterComponent },      // New user registration page
  { path: 'about', component: AboutComponent },            // About page with app information
  
  // Protected routes: Require authentication (AuthGuard checks if user is logged in)
  // If not authenticated, user is redirected to /login
  { path: 'admin-dashboard', component: AdminDashboardComponent, canActivate: [AuthGuard] },       // Admin control panel
  { path: 'engineer-dashboard', component: EngineerDashboardComponent, canActivate: [AuthGuard] }, // Employee/Engineer view
  { path: 'manager-dashboard', component: ManagerDashboardComponent, canActivate: [AuthGuard] },   // Manager view
  
  // TODO: Add wildcard route for 404 page
  // { path: '**', component: NotFoundComponent },
];

@NgModule({
  // imports: Configure router with routes using forRoot (for root module only)
  // forRoot creates router service and registers global router directives
  imports: [RouterModule.forRoot(routes)],
  
  // exports: Make RouterModule available to components in this module
  // This makes router directives (routerLink, router-outlet) available
  exports: [RouterModule]
})
export class AppRoutingModule {
  // This module handles all application routing configuration
  // Imported in AppModule to enable navigation throughout the app
}

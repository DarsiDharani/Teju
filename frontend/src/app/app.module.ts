/**
 * Angular Application Root Module
 * 
 * Purpose: Root module that bootstraps the Angular application
 * Features:
 * - Declares all application components, pipes, and directives
 * - Imports required Angular modules (Forms, HTTP, Animations, etc.)
 * - Configures application-wide providers
 * - Bootstraps the root AppComponent
 * 
 * @author Orbit Skill Development Team
 * @date 2025
 */

// Core Angular Modules
import { NgModule } from '@angular/core';  // NgModule decorator for defining Angular modules
import { CommonModule } from '@angular/common';  // Common Angular directives (ngIf, ngFor, etc.)

// Browser and Platform Modules
import { BrowserModule } from '@angular/platform-browser';  // Required for running Angular in browser
import { FormsModule, ReactiveFormsModule } from '@angular/forms';  // Form handling (template-driven and reactive)
import { HttpClientModule } from '@angular/common/http';  // HTTP client for API communication

// Animation and Material Design Modules
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';  // Enables Angular animations
import { MatSnackBarModule } from '@angular/material/snack-bar';  // Material Design snackbar/toast notifications

// Application Routing and Root Component
import { AppRoutingModule } from './app-routing.module';  // Application route configuration
import { AppComponent } from './app.component';  // Root application component

// Shared Layout Components (used across multiple pages)
import { NavbarComponent } from './components/navbar/navbar.component';  // Top navigation bar with links
import { HomeComponent } from './components/home/home.component';  // Landing/home page
import { LoginComponent } from './components/login/login.component';  // User login form
import { RegisterComponent } from './components/register/register.component';  // New user registration form
import { AboutComponent } from './components/about/about.component';  // About page with app info

// Dashboard Components (role-specific views)
import { EngineerDashboardComponent } from './dashboards/engineer-dashboard/engineer-dashboard.component';  // Employee/Engineer view
import { ManagerDashboardComponent } from './dashboards/manager-dashboard/manager-dashboard.component';  // Manager view
import { AdminDashboardComponent } from './dashboards/admin-dashboard/admin-dashboard.component';  // Admin view

// Custom Pipes (data transformation for templates)
import { SkillFilterPipe } from './pipes/skill-filter.pipe';  // Filter skills by search criteria
import { GenericFilterPipe } from './pipes/generic-filter.pipe';  // Generic array filtering

// Reusable UI Components
import { ToastComponent } from './components/toast/toast.component';  // Toast notification messages
import { NotificationsComponent } from './components/notifications/notifications.component';  // Notification bell and dropdown
import { SearchableDropdownComponent } from './components/searchable-dropdown/searchable-dropdown.component';  // Dropdown with search

@NgModule({
  // declarations: All components, directives, and pipes that belong to this module
  // These are the building blocks of your Angular application
  declarations: [
    AppComponent,                      // Root component
    NavbarComponent,                   // Navigation bar
    HomeComponent,                     // Home page
    LoginComponent,                    // Login page
    RegisterComponent,                 // Registration page
    AboutComponent,                    // About page
    EngineerDashboardComponent,        // Engineer/Employee dashboard
    ManagerDashboardComponent,         // Manager dashboard
    AdminDashboardComponent,           // Admin dashboard
    SkillFilterPipe,                   // Skill search/filter pipe
    GenericFilterPipe,                 // Generic array filter pipe
    ToastComponent,                    // Toast notification component
    NotificationsComponent,            // Notification center component
    SearchableDropdownComponent,       // Searchable dropdown component
  ],
  // imports: External modules this application depends on
  // These provide functionality like forms, HTTP, routing, animations
  imports: [
    BrowserModule,                     // Must be imported in root module for browser apps
    FormsModule,                       // Template-driven forms support
    ReactiveFormsModule,               // Reactive forms support (FormBuilder, FormGroup, etc.)
    HttpClientModule,                  // HTTP client for making API requests
    AppRoutingModule,                  // Application routing configuration
    CommonModule,                      // Common Angular directives (ngIf, ngFor, etc.)
    BrowserAnimationsModule,           // Enables animations throughout the app
    MatSnackBarModule,                 // Material Design snackbar for toast notifications
  ],
  // providers: Services that are available application-wide
  // Services are singleton instances shared across the entire app
  // Currently empty because services use @Injectable({ providedIn: 'root' })
  providers: [],
  // bootstrap: The root component that Angular creates and inserts into index.html
  // This is the entry point of the application
  bootstrap: [AppComponent]
})
export class AppModule {
  // This is the root module of the application
  // It is responsible for bootstrapping the entire Angular app
}

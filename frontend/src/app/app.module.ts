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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { NavbarComponent } from './components/navbar/navbar.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AboutComponent } from './components/about/about.component';
import { EngineerDashboardComponent } from './dashboards/engineer-dashboard/engineer-dashboard.component';
import { ManagerDashboardComponent } from './dashboards/manager-dashboard/manager-dashboard.component';
import { AdminDashboardComponent } from './dashboards/admin-dashboard/admin-dashboard.component';
import { SkillFilterPipe } from './pipes/skill-filter.pipe';
import { GenericFilterPipe } from './pipes/generic-filter.pipe';
import { ToastComponent } from './components/toast/toast.component';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { SearchableDropdownComponent } from './components/searchable-dropdown/searchable-dropdown.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    AboutComponent,
    EngineerDashboardComponent,
    ManagerDashboardComponent,
    AdminDashboardComponent,
    SkillFilterPipe,
    GenericFilterPipe,
    ToastComponent,
    NotificationsComponent,
    SearchableDropdownComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    CommonModule,
    BrowserAnimationsModule,
    MatSnackBarModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}

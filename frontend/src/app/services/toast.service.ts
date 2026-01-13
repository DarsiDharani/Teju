/**
 * Toast Service
 * 
 * Purpose: Centralized service for managing toast notifications across the application
 * Features:
 * - Create and display toast messages
 * - Auto-dismiss after configurable duration
 * - Support for multiple toast types (success, error, warning, info)
 * - Observable pattern for reactive updates
 * 
 * @author Orbit Skill Development Team
 * @date 2025
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Interface for toast message structure
 */
export interface ToastMessage {
  /** Unique identifier for the toast */
  id: string;
  /** Type of toast: success, error, warning, or info */
  type: 'success' | 'error' | 'warning' | 'info';
  /** Title text displayed in toast header */
  title: string;
  /** Main message content */
  message: string;
  /** Auto-dismiss duration in milliseconds (0 = no auto-dismiss) */
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  /** BehaviorSubject to hold current array of toast messages */
  private toastsSubject = new BehaviorSubject<ToastMessage[]>([]);
  
  /** Public observable for components to subscribe to toast updates */
  public toasts$ = this.toastsSubject.asObservable();

  /**
   * Generates a unique ID for each toast message
   * @returns Random alphanumeric string
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Main method to show a centered modal notification
   * @param message - The message text to display
   * @param type - Notification type (default: 'info')
   * @param title - Optional title (uses default if not provided)
   * @param duration - Auto-dismiss duration in ms (default: 0 = no auto-dismiss for modals, user must click)
   * @returns The generated notification ID for programmatic removal
   */
  show(message: any, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string, duration: number = 0): string {
    const id = this.generateId();
    
    // Ensure message is always a string and handle various error formats
    const messageStr = this.extractMessage(message);
    
    const toast: ToastMessage = {
      id,
      type,
      title: title || this.getDefaultTitle(type),
      message: messageStr,
      duration
    };

    // For centered modals, only show one at a time (replace existing)
    // This ensures the user focuses on one notification at a time
    this.toastsSubject.next([toast]);

    // Auto remove after duration (if duration > 0)
    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  /**
   * Extracts a readable message from various input types
   * @param message - Message in any format (string, object, error, etc.)
   * @returns Formatted string message
   */
  private extractMessage(message: any): string {
    // If it's already a string, return it
    if (typeof message === 'string') {
      return message;
    }

    // If it's null or undefined
    if (message == null) {
      return 'No message provided';
    }

    // If it's an object, try to extract meaningful information
    if (typeof message === 'object') {
      // Check for common error object structures
      if (message.detail) {
        return typeof message.detail === 'string' ? message.detail : JSON.stringify(message.detail);
      }
      if (message.message) {
        return typeof message.message === 'string' ? message.message : JSON.stringify(message.message);
      }
      if (message.error) {
        return this.extractMessage(message.error);
      }
      
      // For FastAPI 422 validation errors
      if (Array.isArray(message) && message.length > 0 && message[0].msg) {
        return message.map((err: any) => err.msg).join(', ');
      }

      // Try to stringify the object
      try {
        const str = JSON.stringify(message);
        // Don't return empty objects
        if (str === '{}' || str === '[]') {
          return 'An error occurred';
        }
        return str;
      } catch (e) {
        return 'An error occurred';
      }
    }

    // For any other type, convert to string
    return String(message);
  }

  /**
   * Convenience method to show a success modal
   * @param message - Success message text
   * @param title - Optional title
   * @param duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
   * @returns Notification ID
   */
  success(message: string, title?: string, duration?: number): string {
    return this.show(message, 'success', title || 'Success!', duration);
  }

  /**
   * Convenience method to show an error modal
   * @param message - Error message text
   * @param title - Optional title
   * @param duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
   * @returns Notification ID
   */
  error(message: string, title?: string, duration?: number): string {
    return this.show(message, 'error', title || 'Error', duration);
  }

  /**
   * Convenience method to show a warning modal
   * @param message - Warning message text
   * @param title - Optional title
   * @param duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
   * @returns Notification ID
   */
  warning(message: string, title?: string, duration?: number): string {
    return this.show(message, 'warning', title || 'Warning', duration);
  }

  /**
   * Convenience method to show an info modal
   * @param message - Info message text
   * @param title - Optional title
   * @param duration - Auto-dismiss duration in ms (0 = no auto-dismiss)
   * @returns Notification ID
   */
  info(message: string, title?: string, duration?: number): string {
    return this.show(message, 'info', title || 'Information', duration);
  }

  /**
   * Removes a specific toast by ID
   * @param id - Unique identifier of the toast to remove
   */
  remove(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  /**
   * Clears all active toast messages
   */
  clear(): void {
    this.toastsSubject.next([]);
  }

  /**
   * Returns default title text based on toast type
   * @param type - Toast type
   * @returns Default title string
   */
  private getDefaultTitle(type: string): string {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      default: return 'Notification';
    }
  }
}

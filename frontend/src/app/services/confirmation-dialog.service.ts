/**
 * Confirmation Dialog Service
 * 
 * Purpose: Provides reusable confirmation dialogs throughout the application
 * Features:
 * - Promise-based confirmation dialogs
 * - Customizable title, message, and button text
 * - Observable pattern for reactive UI updates
 * - Non-blocking async confirmations
 * 
 * Usage Example:
 * ```typescript
 * const confirmed = await this.confirmationService.show({
 *   title: 'Delete Item',
 *   message: 'Are you sure you want to delete this item?',
 *   okText: 'Delete',
 *   cancelText: 'Cancel'
 * });
 * if (confirmed) {
 *   // User clicked OK/Delete
 * } else {
 *   // User clicked Cancel
 * }
 * ```
 * 
 * @author Orbit Skill Development Team
 * @date 2025
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * Interface for confirmation dialog configuration options
 */
export interface ConfirmationOptions {
  /** Dialog title/heading (default: 'Confirm') */
  title?: string;
  /** Main message/question to display */
  message: string;
  /** Text for confirmation button (default: 'OK') */
  okText?: string;
  /** Text for cancel button (default: 'Cancel') */
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'  // Available application-wide as singleton
})
export class ConfirmationDialogService {
  /** Holds current confirmation dialog options (null when no dialog is active) */
  private confirmationSubject = new BehaviorSubject<ConfirmationOptions | null>(null);
  
  /** Holds user's choice (true=confirmed, false=cancelled, null=pending) */
  private resultSubject = new BehaviorSubject<boolean | null>(null);

  /** Observable for components to subscribe to dialog state changes */
  public confirmation$: Observable<ConfirmationOptions | null> = this.confirmationSubject.asObservable();
  
  /** Observable for getting user's confirmation result */
  public result$: Observable<boolean | null> = this.resultSubject.asObservable();

  /**
   * Displays a confirmation dialog and returns a promise that resolves with user's choice
   * 
   * This method creates a new confirmation dialog with the specified options and returns
   * a promise that resolves when the user makes a choice (confirm or cancel).
   * 
   * @param options - Configuration for the dialog (message, title, button text)
   * @returns Promise<boolean> - Resolves to true if user confirms, false if user cancels
   */
  show(options: ConfirmationOptions): Promise<boolean> {
    return new Promise((resolve) => {
      // Subscribe to result changes to detect when user makes a choice
      const subscription = this.result$.subscribe((result) => {
        if (result !== null) {
          // User has made a choice (either confirmed or cancelled)
          resolve(result);  // Resolve promise with user's choice
          subscription.unsubscribe();  // Clean up subscription
          this.resultSubject.next(null);  // Reset result for next dialog
        }
      });

      // Display the confirmation dialog with provided or default options
      this.confirmationSubject.next({
        title: options.title || 'Confirm',  // Use provided title or default
        message: options.message,  // Required message
        okText: options.okText || 'OK',  // Use provided text or default
        cancelText: options.cancelText || 'Cancel'  // Use provided text or default
      });
    });
  }

  /**
   * Called when user clicks the OK/Confirm button
   * Sets result to true and closes the dialog
   */
  confirm(): void {
    this.resultSubject.next(true);  // User confirmed
    this.confirmationSubject.next(null);  // Close dialog
  }

  /**
   * Called when user clicks the Cancel button or closes the dialog
   * Sets result to false and closes the dialog
   */
  cancel(): void {
    this.resultSubject.next(false);  // User cancelled
    this.confirmationSubject.next(null);  // Close dialog
  }
}

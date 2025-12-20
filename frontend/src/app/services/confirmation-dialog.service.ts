import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ConfirmationOptions {
  title?: string;
  message: string;
  okText?: string;
  cancelText?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {
  private confirmationSubject = new BehaviorSubject<ConfirmationOptions | null>(null);
  private resultSubject = new BehaviorSubject<boolean | null>(null);

  public confirmation$: Observable<ConfirmationOptions | null> = this.confirmationSubject.asObservable();
  public result$: Observable<boolean | null> = this.resultSubject.asObservable();

  show(options: ConfirmationOptions): Promise<boolean> {
    return new Promise((resolve) => {
      const subscription = this.result$.subscribe((result) => {
        if (result !== null) {
          resolve(result);
          subscription.unsubscribe();
          this.resultSubject.next(null);
        }
      });

      this.confirmationSubject.next({
        title: options.title || 'Popkind',
        message: options.message,
        okText: options.okText || 'OK',
        cancelText: options.cancelText || 'Cancel'
      });
    });
  }

  confirm(): void {
    this.resultSubject.next(true);
    this.confirmationSubject.next(null);
  }

  cancel(): void {
    this.resultSubject.next(false);
    this.confirmationSubject.next(null);
  }
}

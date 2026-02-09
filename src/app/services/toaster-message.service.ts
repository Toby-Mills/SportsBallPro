import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error';
  dismissible: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToasterMessageService {
  private readonly defaultDurationMs = 3000;
  private messagesSubject = new BehaviorSubject<ToastMessage[]>([]);
  messages$ = this.messagesSubject.asObservable();

  constructor() {}

  showMessage(
    message: string,
    type: 'success' | 'error' = 'success',
    durationMs?: number,
    dismissible: boolean = true,
    title?: string
  ): void {
    const toast: ToastMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      message,
      type,
      dismissible
    };

    this.messagesSubject.next([...this.messagesSubject.value, toast]);

    const timeout = durationMs ?? this.defaultDurationMs;
    if (timeout > 0) {
      setTimeout(() => this.dismissMessage(toast.id), timeout);
    }
  }

  dismissMessage(id: string): void {
    this.messagesSubject.next(this.messagesSubject.value.filter(msg => msg.id !== id));
  }
}

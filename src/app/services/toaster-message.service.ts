import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ToastMessage {
  id: string;
  title?: string;
  message: string;
  type: 'success' | 'error';
  dismissible: boolean;
  iconPath?: string;
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
    title?: string,
    iconPath?: string
  ): void {
    const toast: ToastMessage = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      title,
      message,
      type,
      dismissible,
      iconPath
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

  clearAll(): void {
    this.messagesSubject.next([]);
  }
}

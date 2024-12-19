import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToasterMessageService {

  private messageSubject = new Subject<{ message: string, type: 'success' | 'error' }>();
  message$ = this.messageSubject.asObservable();

  constructor() {}

  showMessage(message: string, type: 'success' | 'error' = 'success'): void {
    this.messageSubject.next({ message, type });
  }
}

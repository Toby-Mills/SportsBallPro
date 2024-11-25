import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ToasterMessageService {

  private messageSubject = new Subject<string>();
  message$ = this.messageSubject.asObservable();

  constructor() {}

  showMessage(message: string): void {
    this.messageSubject.next(message);
  }}

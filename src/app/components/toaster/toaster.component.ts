import { Component ,OnInit } from '@angular/core';
import { ToastMessage, ToasterMessageService } from '../../services/toaster-message.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toaster',
    imports: [CommonModule],
    templateUrl: './toaster.component.html',
    styleUrl: './toaster.component.css',
    standalone: true
})
export class ToasterComponent {
  messages: ToastMessage[] = [];

  constructor(private toasterService: ToasterMessageService) {}

  ngOnInit(): void {
    this.toasterService.messages$.subscribe(messages => {
      this.messages = messages;
    });
  }

  dismissMessage(id: string): void {
    this.toasterService.dismissMessage(id);
  }

  clearAll(): void {
    this.toasterService.clearAll();
  }
}

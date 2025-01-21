import { Component ,OnInit } from '@angular/core';
import { ToasterMessageService } from '../services/toaster-message.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-toaster',
    imports: [CommonModule],
    templateUrl: './toaster.component.html',
    styleUrl: './toaster.component.css'
})
export class ToasterComponent {
  message: string | null = null;
  showToast = false;
  messageType: 'success' | 'error' = 'success';

  constructor(private toasterService: ToasterMessageService) {}

  ngOnInit(): void {
    this.toasterService.message$.subscribe(msg => {
      this.message = msg.message;
      this.messageType = msg.type;
      this.showToast = true;

      // Auto-hide the message after 3 seconds
      setTimeout(() => {
        this.showToast = false;
      }, 3000);
    });
  }
}

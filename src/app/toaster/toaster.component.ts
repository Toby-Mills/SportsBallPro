import { Component ,OnInit } from '@angular/core';
import { ToasterMessageService } from '../services/toaster-message.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toaster',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toaster.component.html',
  styleUrl: './toaster.component.css'
})
export class ToasterComponent {
  message: string | null = null;
  showToast = false;

  constructor(private toasterService: ToasterMessageService) {}

  ngOnInit(): void {
    this.toasterService.message$.subscribe(msg => {
      this.message = msg;
      this.showToast = true;

      // Auto-hide the message after 5 seconds
      setTimeout(() => {
        this.showToast = false;
      }, 5000);
    });
  }
}

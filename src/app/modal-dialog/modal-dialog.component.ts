import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
    selector: 'app-modal-dialog',
    imports: [CommonModule],
    templateUrl: './modal-dialog.component.html',
    styleUrl: './modal-dialog.component.css'
})
export class ModalDialogComponent {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Modal Title';
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.isVisible = false;
    this.close.emit();
  }

  onBackdropClick() {
    this.closeModal();
  }

  preventClose(event: MouseEvent) {
    event.stopPropagation();
  }
}

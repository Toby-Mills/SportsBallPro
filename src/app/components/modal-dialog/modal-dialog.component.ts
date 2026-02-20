import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, EventEmitter, Input, Output, Inject, OnInit, OnDestroy, ElementRef } from '@angular/core';

@Component({
    selector: 'app-modal-dialog',
    imports: [CommonModule],
    templateUrl: './modal-dialog.component.html',
    styleUrl: './modal-dialog.component.css'
})
export class ModalDialogComponent implements OnInit, OnDestroy {
  @Input() isVisible: boolean = false;
  @Input() title: string = 'Modal Title';
  @Input() titleIcon: string | null = null;
  @Output() close = new EventEmitter<void>();

  private originalParent: HTMLElement | null = null;

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private elementRef: ElementRef
  ) {}

  ngOnInit() {
    // Store original parent and move modal to body
    this.originalParent = this.elementRef.nativeElement.parentElement;
    this.document.body.appendChild(this.elementRef.nativeElement);
  }

  ngOnDestroy() {
    // Clean up: move back to original parent if it exists
    if (this.originalParent && this.elementRef.nativeElement.parentElement === this.document.body) {
      this.originalParent.appendChild(this.elementRef.nativeElement);
    }
  }

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

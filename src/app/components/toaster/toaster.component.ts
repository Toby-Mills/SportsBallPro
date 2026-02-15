import { Component ,OnInit, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { ToastMessage, ToasterMessageService } from '../../services/toaster-message.service';
import { CommonModule } from '@angular/common';

interface TouchState {
  startX: number;
  currentX: number;
  isDragging: boolean;
}

@Component({
    selector: 'app-toaster',
    imports: [CommonModule],
    templateUrl: './toaster.component.html',
    styleUrl: './toaster.component.css',
    standalone: true
})
export class ToasterComponent {
  messages: ToastMessage[] = [];
  touchStates: Map<string, TouchState> = new Map();
  swipeOffsets: Map<string, number> = new Map();
  dismissingIds: Set<string> = new Set();
  cardHeights: Map<string, number> = new Map();
  private readonly swipeThreshold = 100;
  private readonly dismissAnimationDuration = 500;

  @ViewChildren('toastElement') toastElements!: QueryList<ElementRef>;

  constructor(private toasterService: ToasterMessageService) {}

  ngOnInit(): void {
    this.toasterService.messages$.subscribe(messages => {
      this.messages = messages;
    });
  }

  dismissMessage(id: string): void {
    // Measure the card height before dismissing
    const element = this.toastElements?.find(el => 
      el.nativeElement.getAttribute('data-id') === id
    );
    
    if (element) {
      const height = element.nativeElement.clientHeight;
      this.cardHeights.set(id, height);
    }
    
    this.dismissingIds.add(id);
    this.swipeOffsets.delete(id);
    setTimeout(() => {
      this.toasterService.dismissMessage(id);
      this.dismissingIds.delete(id);
      this.cardHeights.delete(id);
    }, this.dismissAnimationDuration);
  }

  clearAll(): void {
    this.toasterService.clearAll();
    this.swipeOffsets.clear();
    this.dismissingIds.clear();
    this.cardHeights.clear();
  }

  onTouchStart(event: TouchEvent, id: string): void {
    const touch = event.touches[0];
    this.touchStates.set(id, {
      startX: touch.clientX,
      currentX: touch.clientX,
      isDragging: true
    });
  }

  onTouchMove(event: TouchEvent, id: string): void {
    const state = this.touchStates.get(id);
    if (!state) return;

    const touch = event.touches[0];
    state.currentX = touch.clientX;
    const offset = state.startX - touch.clientX;
    this.swipeOffsets.set(id, offset);
  }

  onTouchEnd(id: string): void {
    const state = this.touchStates.get(id);
    if (!state) return;

    const delta = state.startX - state.currentX;
    if (Math.abs(delta) > this.swipeThreshold) {
      this.dismissMessage(id);
    } else {
      this.swipeOffsets.delete(id);
    }

    this.touchStates.delete(id);
  }

  getToastStyle(id: string): { [key: string]: string } {
    const swipeStyle = this.getSwipeStyle(id);
    const dismissStyle = this.getDismissStyle(id);
    return { ...swipeStyle, ...dismissStyle };
  }

  getSwipeStyle(id: string): { [key: string]: string } {
    const offset = this.swipeOffsets.get(id) || 0;
    return {
      transform: `translateX(${-offset}px)`,
      opacity: offset > 0 ? String(Math.max(0.3, 1 - offset / 200)) : '1'
    };
  }

  getDismissStyle(id: string): { [key: string]: string } {
    if (this.dismissingIds.has(id)) {
      const height = this.cardHeights.get(id) || 0;
      return {
        height: '0',
        opacity: '0',
        margin: '0',
        padding: '0'
      };
    }
    const height = this.cardHeights.get(id);
    if (height) {
      return { height: `${height}px` };
    }
    return {};
  }
}

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatchService } from '../../services/match.service';

@Component({
    selector: 'app-refresh-timer',
    imports: [CommonModule],
    templateUrl: './refresh-timer.component.html',
    styleUrl: './refresh-timer.component.css',
    standalone: true
})
export class RefreshTimerComponent implements OnDestroy {
  @Output() timerTriggered: EventEmitter<number> = new EventEmitter<number>();

  @Input() interval: number = MatchService.REFRESH_INTERVAL_MS;
  @Input() nextRefreshAt: number | null = null;

  screenUpdateTimer: any;
  count: number = 0;
  timeToNextTrigger: number = 0;
  percentage: number = 0;
  dashOffset: string = '';
  strokeStartColor: string = '#88BEB2';
  strokeCurrentColor: string = '';

  ngOnInit(): void {
    this.screenUpdateTimer = setInterval(() => {
      this.timeToNextTrigger = this.nextRefreshAt ? Math.max(0, this.nextRefreshAt - Date.now()) : 0;
      this.countdownToNextRefresh();
    }, 500)
  }

  ngOnDestroy(): void {
    clearInterval(this.screenUpdateTimer);
  }

  triggerTimer() {
    this.timerTriggered.emit(this.count);
  }

  countdownToNextRefresh(): void {
    this.percentage = (this.timeToNextTrigger / this.interval) * 100;
    const circumference = 2 * Math.PI * 10;
    const dashOffset = circumference * (this.percentage / 100);
    this.dashOffset = `${dashOffset}, ${circumference}`;

    this.strokeCurrentColor = this.strokeStartColor + Math.round(((100 - (this.percentage/1.3))*2.55)).toString(16).toUpperCase();
  }

}

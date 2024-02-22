import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

@Component({
  selector: 'app-refresh-timer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './refresh-timer.component.html',
  styleUrl: './refresh-timer.component.css'
})
export class RefreshTimerComponent implements OnDestroy {
  @Output() timerTriggered: EventEmitter<number> = new EventEmitter<number>();

  timer: any;
  interval: number = 0;
  screenUpdateTimer: any;
  count: number = 0;
  timeToNextTrigger: number = 0;
  percentage: number = 0;
  dashOffset: string = '';
  strokeColor: string = 'rgb(165, 194, 223)'; // Default stroke color

  ngOnInit(): void {
    this.screenUpdateTimer = setInterval(() => {
      this.timeToNextTrigger -= 500;
      this.countdownToNextRefresh();
    }, 500)
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  setTimer(interval: number) {
    console.log('setTimer', interval)
    this.interval = interval;
    this.stopTimer();
    this.count = 0;
    this.timer = setInterval(() => {
      this.triggerTimer();
    }, interval)
    this.timeToNextTrigger = interval;
  }

  stopTimer(): void {
    clearInterval(this.timer)
  }

  triggerTimer() {
    this.timerTriggered.emit(this.count);
    this.timeToNextTrigger = this.interval;
  }

  countdownToNextRefresh(): void {
    this.percentage = (this.timeToNextTrigger / this.interval) * 100;
    const circumference = 2 * Math.PI * 10;
    const dashOffset = circumference * (this.percentage / 100);
    this.dashOffset = `${dashOffset}, ${circumference}`;
  }

}

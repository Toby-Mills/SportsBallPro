import { Injectable, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { EventDetectionService } from './event-detection.service';
import { NotificationService } from './notification.service';
import { WatchListService } from './watch-list.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationMonitorService implements OnDestroy {
  private watchListSubscription: Subscription;
  private monitoredMatches = new Map<string, Subscription>();

  constructor(
    private watchListService: WatchListService,
    private eventDetectionService: EventDetectionService,
    private notificationService: NotificationService
  ) {
    this.refreshMonitoredMatches();
    this.watchListSubscription = this.watchListService.watchListChanged.subscribe(() => {
      this.refreshMonitoredMatches();
    });
  }

  ngOnDestroy(): void {
    this.watchListSubscription.unsubscribe();
    this.monitoredMatches.forEach(subscription => subscription.unsubscribe());
    this.monitoredMatches.clear();
  }

  private refreshMonitoredMatches(): void {
    const watchList = new Set<string>(this.watchListService.getAllWatchedMatches());
    console.log(`[NotificationMonitor] refreshMonitoredMatches called, watchList:`, Array.from(watchList));

    watchList.forEach(gameId => {
      if (this.monitoredMatches.has(gameId)) {
        console.log(`[NotificationMonitor] Already monitoring gameId: ${gameId}`);
        return;
      }

      console.log(`[NotificationMonitor] Starting to monitor gameId: ${gameId}`);
      const subscription = this.eventDetectionService
        .startMonitoring(gameId)
        .subscribe(event => {
          console.log(`[NotificationMonitor] Received event for gameId: ${gameId}`, event.eventType, event.title);
          this.notificationService.sendNotification(event);
        });

      this.monitoredMatches.set(gameId, subscription);
    });

    Array.from(this.monitoredMatches.keys()).forEach(gameId => {
      if (!watchList.has(gameId)) {
        const subscription = this.monitoredMatches.get(gameId);
        if (subscription) {
          subscription.unsubscribe();
        }
        this.eventDetectionService.stopMonitoring(gameId);
        this.monitoredMatches.delete(gameId);
      }
    });
  }
}

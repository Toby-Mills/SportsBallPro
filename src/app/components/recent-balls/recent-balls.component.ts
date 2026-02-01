import { Component, input, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Ball, Over, RecentBalls } from '../../models/recent-balls';
import { CommonModule, NgFor } from '@angular/common';
import { MatchService } from '../../services/match.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-recent-balls',
    imports: [CommonModule, NgFor],
    templateUrl: './recent-balls.component.html',
    styleUrl: './recent-balls.component.css',
    standalone: true
})
export class RecentBallsComponent implements OnChanges, OnDestroy {
  @Input() inningsNumber: 1 | 2 = 1;
  @Input() teamNumber: 1 | 2 = 1;
  @Input() gameId: string = '';
  recentBalls: RecentBalls = new RecentBalls();
  private subscription?: Subscription;

  constructor(public matchService: MatchService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['inningsNumber'] || changes['teamNumber'] || changes['gameId']) {
      this.subscribe();
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private subscribe() {
    this.subscription?.unsubscribe();
    console.log(`Recent balls component subscribing: innings=${this.inningsNumber}, team=${this.teamNumber}, gameId=${this.gameId}`);
    this.subscription = this.matchService.getRecentOversUpdates(this.gameId, this.inningsNumber, this.teamNumber).subscribe(
      recentBalls => {
        console.log(`Recent balls component received data: innings=${this.inningsNumber}, team=${this.teamNumber}, overs count:`, recentBalls.overs.length);
        this.recentBalls = recentBalls
      }
    );
  }
}
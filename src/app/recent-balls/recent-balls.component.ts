import { Component, input, Input } from '@angular/core';
import { Ball, Over, RecentBalls } from '../models/recent-balls';
import { CommonModule, NgFor } from '@angular/common';
import { MatchService } from '../services/match.service';

@Component({
    selector: 'app-recent-balls',
    imports: [CommonModule, NgFor],
    templateUrl: './recent-balls.component.html',
    styleUrl: './recent-balls.component.css'
})
export class RecentBallsComponent {
  @Input() inningsNumber: 1 | 2 = 1;
  recentBalls: RecentBalls = new RecentBalls();

  constructor(public matchService: MatchService) { }

  ngOnInit() {
    if (this.inningsNumber == 1) {
      this.matchService.innings1RecentOversUpdated.subscribe(
        recentBalls => {
          this.recentBalls = recentBalls
        }
      )
    } else {
      this.matchService.innings2RecentOversUpdated.subscribe(
        recentBalls => {
          this.recentBalls = recentBalls
        }
      )
    }
  }
}
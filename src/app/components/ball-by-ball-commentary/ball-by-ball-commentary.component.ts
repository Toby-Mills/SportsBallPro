import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { MatchService } from '../../services/match.service';
import { BallByBallCommentary } from '../../models/ball-commentary';
import { OverCommentaryComponent } from '../over-commentary/over-commentary.component';

@Component({
  selector: 'app-ball-by-ball-commentary',
  imports: [CommonModule, NgFor, NgIf, OverCommentaryComponent],
  templateUrl: './ball-by-ball-commentary.component.html',
  styleUrl: './ball-by-ball-commentary.component.css',
  standalone: true
})
export class BallByBallCommentaryComponent implements OnChanges, OnDestroy {
  @Input() battingInningsNumber: 1 | 2 | 3 | 4 = 1;
  @Input() teamNumber: 1 | 2 = 1;
  @Input() gameId: string = '';

  commentary: BallByBallCommentary = new BallByBallCommentary();
  private subscription?: Subscription;

  constructor(private matchService: MatchService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['battingInningsNumber'] || changes['teamNumber'] || changes['gameId']) {
      this.subscribe();
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  get displayOvers() {
    return this.commentary.overs.slice().reverse();
  }

  private subscribe() {
    this.subscription?.unsubscribe();
    this.subscription = this.matchService
      .getBallByBallCommentaryUpdates(this.gameId, this.battingInningsNumber)
      .subscribe(commentary => {
        this.commentary = commentary;
      });
  }
}

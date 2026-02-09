import { Component, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FallOfWickets } from '../../models/fall-of-wickets';
import { CommonModule } from '@angular/common';
import { MatchService } from '../../services/match.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-fall-of-wickets',
    imports: [CommonModule],
    templateUrl: './fall-of-wickets.component.html',
    styleUrl: './fall-of-wickets.component.css',
    standalone: true
})
export class FallOfWicketsComponent implements OnChanges, OnDestroy {
  @Input() battingInningsNumber: 1 | 2 | 3 | 4 = 1;
  @Input() teamNumber: 1 | 2 = 1;
  @Input() gameId: string = '';
  public fallOfWickets:FallOfWickets = new FallOfWickets;
  private subscription?: Subscription;

  constructor (public matchService: MatchService){}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['battingInningsNumber'] || changes['gameId']) {
      this.subscribe();
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  private subscribe() {
    this.subscription?.unsubscribe();
    this.subscription = this.matchService.getFallOfWicketsUpdates(this.gameId, this.battingInningsNumber).subscribe(
      fallOfWickets => {
        this.fallOfWickets = fallOfWickets;
      }
    );
  }
}

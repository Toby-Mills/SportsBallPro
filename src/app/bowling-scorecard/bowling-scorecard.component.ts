import { CommonModule, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BowlingScorecard } from '../models/scorecard';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-bowling-scorecard',
  standalone: true,
  imports: [
    CommonModule,
    NgFor],
  templateUrl: './bowling-scorecard.component.html',
  styleUrl: './bowling-scorecard.component.css'
})
export class BowlingScorecardComponent {
  @Input() teamNumber: 1 | 2 = 1;
  public scorecard: BowlingScorecard = new BowlingScorecard();

  constructor(public matchService: MatchService) { }

  ngOnInit() {
    if (this.teamNumber == 1) {
      this.matchService.teamABowlingScorecardUpdated.subscribe(
        scorecard => {
          this.scorecard = scorecard
        }
      )
    }
    else {
      this.matchService.teamBBowlingScorecardUpdated.subscribe(
        scorecard => {
          this.scorecard = scorecard
        }
      )
    }
  }
}
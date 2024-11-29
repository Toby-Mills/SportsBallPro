import { CommonModule, NgFor } from '@angular/common';
import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { BowlingScorecard, BowlingScorecardEntry } from '../models/scorecard';
import { MatchService } from '../services/match.service';
import { FormsModule } from '@angular/forms';

@Pipe({
  name: 'visible',
  standalone: true,
})
export class VisibleBowlers implements PipeTransform {
  transform(bowlers: BowlingScorecardEntry[], allBowlers: boolean): BowlingScorecardEntry[] {
    return bowlers.filter(bowler => {
      return (allBowlers || (bowler.strikeBowler || bowler.nonStrikeBowler));
    })
  }
}

@Component({
  selector: 'app-bowling-scorecard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    VisibleBowlers
  ],
  templateUrl: './bowling-scorecard.component.html',
  styleUrl: './bowling-scorecard.component.css'
})
export class BowlingScorecardComponent {
  @Input() teamNumber: 1 | 2 = 1;
  public scorecard: BowlingScorecard = new BowlingScorecard();
  public allBowlers: boolean = false;

  constructor(public matchService: MatchService) { }

  ngOnInit() {
    this.matchService.teamABowlingScorecardUpdated.subscribe(
      scorecard => {
        if (this.teamNumber == 1) {
          this.scorecard = scorecard;
        }
      }
    )
    this.matchService.teamBBowlingScorecardUpdated.subscribe(
      scorecard => {
        if (this.teamNumber == 2) {
          this.scorecard = scorecard;
        }
      }
    )
  }
}
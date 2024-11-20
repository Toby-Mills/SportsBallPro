import { Component, Input, Pipe, PipeTransform } from '@angular/core';
import { BattingScorecard, BattingScorecardEntry } from '../models/scorecard';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatchService } from '../services/match.service';


@Pipe({
  name: 'visible',
  standalone: true,
})
export class VisibleBatter implements PipeTransform {
  transform(batters: BattingScorecardEntry[], allBatters: boolean): BattingScorecardEntry[] {
    return batters.filter(batter => {
      switch (batter.howOutFull) {
        case '':
        case 'dnb': return false;
          break;
        case 'n/o': return true;
          break;
        default:
          return allBatters;
      }
    })
  }
}

@Component({
  selector: 'app-batting-scorecard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    VisibleBatter,
  ],
  templateUrl: './batting-scorecard.component.html',
  styleUrl: './batting-scorecard.component.css'
})
export class BattingScorecardComponent {
  @Input()teamNumber: 1 | 2 = 1;
  public scorecard: BattingScorecard = new BattingScorecard;
  public allBatters: boolean = false;

  constructor(public matchService: MatchService){}

  ngOnInit(){
    if (this.teamNumber == 1){
      this.matchService.teamAbattingScorecardUpdated.subscribe(
        scorecard => {
          this.scorecard = scorecard;
        }
      )
    }
    if (this.teamNumber == 2){
      this.matchService.teamBbattingScorecardUpdated.subscribe(
        scorecard => {
          this.scorecard = scorecard;
        }
      )
    }
  }
}

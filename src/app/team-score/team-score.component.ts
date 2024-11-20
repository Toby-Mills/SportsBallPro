import { Component, Input } from '@angular/core';
import { TeamScore } from '../models/team-score';
import { CommonModule, NgClass } from '@angular/common';
import { MatchService } from '../services/match.service';

@Component({
  selector: 'app-team-score',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './team-score.component.html',
  styleUrl: './team-score.component.css'
})
export class TeamScoreComponent {
  @Input() teamNumber: number = 0;
  public teamScore: TeamScore = new TeamScore;
  public logoUrl: string = '';

  constructor(private matchService: MatchService) { }

  ngOnInit() {
  
    if (this.teamNumber == 1) {
      this.matchService.teamAScoreUpdated.subscribe(
        teamScore => {
          this.teamScore = teamScore;
          this.logoUrl = `https://www.websports.co.za/images/logos/small_${this.teamScore.logoName}`; // Dynamically generate the image URL
        }
      )
    }

    if (this.teamNumber == 2) {
      this.matchService.teamBScoreUpdated.subscribe(
        teamScore => {
          this.teamScore = teamScore;
          this.logoUrl = `https://www.websports.co.za/images/logos/small_${this.teamScore.logoName}`; // Dynamically generate the image URL
        }
      )
    }

  }


  public onImageError() {
    if (this.teamNumber === 1) {
      this.logoUrl = 'assets/logos/small_Team_A.png'; // Default image for team 1
    } else {
      this.logoUrl = 'assets/logos/small_Team_B.png'; // Default image for team 2
    }
  }
}

import { Component, Input } from '@angular/core';
import { TeamScore } from '../../models/team-score';
import { CommonModule, NgClass } from '@angular/common';
import { MatchService } from '../../services/match.service';
import { WebSportsAPIService } from '../../services/web-sports-api.service';

@Component({
    selector: 'app-team-score',
    imports: [CommonModule, NgClass],
    templateUrl: './team-score.component.html',
    styleUrl: './team-score.component.css',
    standalone: true
})
export class TeamScoreComponent {
  @Input() teamNumber: 1 | 2 = 1;
  @Input() gameId: string = '';
  public teamScore: TeamScore = new TeamScore;
  public logoUrl: string = '';

  constructor(private matchService: MatchService, private webSportsAPI: WebSportsAPIService) { }

  ngOnInit() {
  
    if (this.teamNumber == 1) {
      this.matchService.getTeamAScoreUpdates(this.gameId).subscribe(
        teamScore => {
          this.teamScore = teamScore;
          this.logoUrl = this.webSportsAPI.teamSmallLogoUrl(this.teamScore.logoName, this.teamNumber);
        }
      )
    }

    if (this.teamNumber == 2) {
      this.matchService.getTeamBScoreUpdates(this.gameId).subscribe(
        teamScore => {
          this.teamScore = teamScore;
          this.logoUrl = this.webSportsAPI.teamSmallLogoUrl(this.teamScore.logoName, this.teamNumber);
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

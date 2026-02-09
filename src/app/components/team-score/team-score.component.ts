import { Component, Input, Output, EventEmitter } from '@angular/core';
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
  @Input() gameId: string = '';
  @Input() battingInningsNumber: 1 | 2 | 3 | 4 = 1;
  @Input() isSelected: boolean = false;
  @Output() cardClicked = new EventEmitter<1 | 2 | 3 | 4>();
  public teamScore: TeamScore = new TeamScore;
  public logoUrl: string = '';
  public teamNumber: 1 | 2 = 1;

  constructor(private matchService: MatchService, private webSportsAPI: WebSportsAPIService) { }

  ngOnInit() {
    this.matchService.getTeamScoreUpdates(this.gameId, this.battingInningsNumber).subscribe(
      teamScore => {
        this.teamNumber = this.battingInningsNumber % 2 === 1 ? 1 : 2
        this.teamScore = teamScore;
        this.logoUrl = this.webSportsAPI.teamSmallLogoUrl(this.teamScore.logoName, this.teamNumber);
      }
    );
  }


  public onImageError() {
    if (this.teamNumber === 1) {
      this.logoUrl = 'assets/logos/small_Team_A.png'; // Default image for team 1
    } else {
      this.logoUrl = 'assets/logos/small_Team_B.png'; // Default image for team 2
    }
  }

  public onCardClick(): void {
    this.cardClicked.emit(this.battingInningsNumber);
  }
}

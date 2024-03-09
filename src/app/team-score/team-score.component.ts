import { Component, Input } from '@angular/core';
import { TeamScore } from '../models/team-score';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'app-team-score',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './team-score.component.html',
  styleUrl: './team-score.component.css'
})
export class TeamScoreComponent {
@Input() teamScore: TeamScore = new TeamScore;
@Input() teamNumber: number = 0;
public logoUrl: string = '';

ngOnChanges(){
  this.logoUrl = `assets/logos/small_${this.teamScore.logoName}`; // Dynamically generate the image URL
}

public onImageError(){
  if (this.teamNumber === 1) {
    this.logoUrl = 'assets/logos/small_Team_A.png'; // Default image for team 1
  } else {
    this.logoUrl = 'assets/logos/small_Team_B.png'; // Default image for other teams
  }}
}

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
}

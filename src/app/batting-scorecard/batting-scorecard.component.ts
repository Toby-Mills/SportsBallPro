import { Component, Input } from '@angular/core';
import { BattingScorecard } from '../models/scorecard';
import { CommonModule, NgFor } from '@angular/common';

@Component({
  selector: 'app-batting-scorecard',
  standalone: true,
  imports: [
    CommonModule,
    NgFor],
  templateUrl: './batting-scorecard.component.html',
  styleUrl: './batting-scorecard.component.css'
})
export class BattingScorecardComponent {
@Input()scorecard = new BattingScorecard;
}

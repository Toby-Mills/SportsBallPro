import { CommonModule, NgFor } from '@angular/common';
import { Component, Input } from '@angular/core';
import { BowlingScorecard } from '../models/scorecard';

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
@Input()scorecard = new BowlingScorecard;
}
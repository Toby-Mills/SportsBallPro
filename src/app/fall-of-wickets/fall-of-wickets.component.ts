import { Component, Input } from '@angular/core';
import { FallOfWickets } from '../models/fall-of-wickets';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fall-of-wickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fall-of-wickets.component.html',
  styleUrl: './fall-of-wickets.component.css'
})
export class FallOfWicketsComponent {
@Input() fallOfWickets:FallOfWickets = new FallOfWickets;
}

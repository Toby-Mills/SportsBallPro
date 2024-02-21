import { Component, Input } from '@angular/core';
import { Player } from '../models/player';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-current-batters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './current-batters.component.html',
  styleUrl: './current-batters.component.css'
})
export class CurrentBattersComponent {
  @Input() currentBatters: Array<Player> = [];
}

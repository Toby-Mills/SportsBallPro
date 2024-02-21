import { Component, Input } from '@angular/core';
import { Player } from '../models/player';
import { CommonModule, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-current-bowlers',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './current-bowlers.component.html',
  styleUrl: './current-bowlers.component.css'
})
export class CurrentBowlersComponent {
  @Input()currentBowlers:Array<Player> = [];
}

import { Component, Input } from '@angular/core';
import { Player } from '../models/player';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { CurrentBowlers } from '../models/current-bowlers';

@Component({
  selector: 'app-current-bowlers',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor],
  templateUrl: './current-bowlers.component.html',
  styleUrl: './current-bowlers.component.css'
})
export class CurrentBowlersComponent {
  @Input() currentBowlers:CurrentBowlers = new CurrentBowlers;
  public lastUpdateSignature: string = '';
}

import { Component, Input } from '@angular/core';
import { Player } from '../models/player';
import { CommonModule } from '@angular/common';
import { CurrentBatters } from '../models/current-batters';

@Component({
    selector: 'app-current-batters',
    imports: [CommonModule],
    templateUrl: './current-batters.component.html',
    styleUrl: './current-batters.component.css',
    standalone: true
})
export class CurrentBattersComponent {
  @Input()currentBatters: CurrentBatters = new CurrentBatters;
}

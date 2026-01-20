import { Component } from '@angular/core';
import { StatsContainerComponent } from '../stats-container/stats-container.component';

@Component({
  selector: 'app-wynberg-stats-container',
  standalone: true,
  imports: [StatsContainerComponent],
  templateUrl: './wynberg-stats-container.component.html',
  styleUrl: './wynberg-stats-container.component.css'
})
export class WynbergStatsContainerComponent {}

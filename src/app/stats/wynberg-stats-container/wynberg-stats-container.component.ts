import { Component } from '@angular/core';
import { StatsContainerComponent } from '../stats-container/stats-container.component';

@Component({
  selector: 'app-wynberg-stats-container',
  standalone: true,
  imports: [StatsContainerComponent],
  template: `
    <div class="header">
      <img src="https://www.websports.co.za/images/logos/small_wynberg.png" alt="Logo" class="logo">
      <h1>Wynberg BHS Cricket Statistics</h1>
    </div>
    
    <app-stats-container 
      [prefilterTeam]="'Wynberg BHS'"
      [showTeamSearch]="false">
    </app-stats-container>
  `,
  styles: [`
    .header {
      text-align: center;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .logo {
      height: 50px;
      margin-right: 15px;
    }
  `]
})
export class WynbergStatsContainerComponent {}

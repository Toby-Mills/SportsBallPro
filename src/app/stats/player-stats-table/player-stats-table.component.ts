import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface PlayerDisplay {
  PlayerName: string;
  PlayerSurname: string;
  gameTeamPairs: any[];
  totalRuns: number;
  totalBalls: number;
  totalFours: number;
  totalSixes: number;
  timesOut: number;
}

@Component({
  selector: 'app-player-stats-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container" *ngIf="players.length > 0">
      <h3>All Players</h3>
      <table>
        <thead>
          <tr>
            <th (click)="sortBy('name')" class="sortable">
              Player Name 
              <span *ngIf="sortField === 'name'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('matches')" class="sortable">
              Matches
              <span *ngIf="sortField === 'matches'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('runs')" class="sortable">
              Runs
              <span *ngIf="sortField === 'runs'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('avgRuns')" class="sortable">
              Avg Runs
              <span *ngIf="sortField === 'avgRuns'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('fours')" class="sortable">
              4s
              <span *ngIf="sortField === 'fours'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('sixes')" class="sortable">
              6s
              <span *ngIf="sortField === 'sixes'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('strikeRate')" class="sortable">
              Strike Rate
              <span *ngIf="sortField === 'strikeRate'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('dismissals')" class="sortable">
              Dismissals
              <span *ngIf="sortField === 'dismissals'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let player of getSortedPlayers()">
            <td>{{ player.PlayerName }} {{ player.PlayerSurname }}</td>
            <td>{{ player.gameTeamPairs.length }}</td>
            <td>{{ player.totalRuns }}</td>
            <td>{{ (player.timesOut > 0 ? (player.totalRuns / player.timesOut).toFixed(2) : '-') }}</td>
            <td>{{ player.totalFours }}</td>
            <td>{{ player.totalSixes }}</td>
            <td>{{ (player.totalBalls > 0 ? Math.round((player.totalRuns / player.totalBalls) * 100) : '-') }}</td>
            <td>{{ player.timesOut }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: [`
    .container {
      margin: 20px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    h3 {
      margin-top: 0;
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th {
      background-color: #f5f5f5;
      padding: 12px;
      text-align: left;
      border-bottom: 2px solid #ddd;
      font-weight: bold;
    }
    td {
      padding: 10px;
      border-bottom: 1px solid #eee;
      text-align: center;
    }
    td:first-child {
      text-align: left;
    }
    tr:hover {
      background-color: #f9f9f9;
    }
    .sortable {
      cursor: pointer;
      user-select: none;
    }
    .sortable:hover {
      background-color: #e9e9e9;
    }
    span {
      margin-left: 5px;
      font-size: 0.8em;
    }
  `]
})
export class PlayerStatsTableComponent {
  @Input() players: PlayerDisplay[] = [];
  @Output() playerSelected = new EventEmitter<PlayerDisplay>();

  sortField: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';
  Math = Math;

  getSortedPlayers(): PlayerDisplay[] {
    return [...this.players].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (this.sortField === 'name') {
        aValue = `${a.PlayerName} ${a.PlayerSurname}`.toLowerCase();
        bValue = `${b.PlayerName} ${b.PlayerSurname}`.toLowerCase();
      } else if (this.sortField === 'matches') {
        aValue = a.gameTeamPairs.length;
        bValue = b.gameTeamPairs.length;
      } else if (this.sortField === 'runs') {
        aValue = a.totalRuns;
        bValue = b.totalRuns;
      } else if (this.sortField === 'avgRuns') {
        aValue = a.timesOut > 0 ? a.totalRuns / a.timesOut : 0;
        bValue = b.timesOut > 0 ? b.totalRuns / b.timesOut : 0;
      } else if (this.sortField === 'fours') {
        aValue = a.totalFours;
        bValue = b.totalFours;
      } else if (this.sortField === 'sixes') {
        aValue = a.totalSixes;
        bValue = b.totalSixes;
      } else if (this.sortField === 'strikeRate') {
        aValue = a.totalBalls > 0 ? (a.totalRuns / a.totalBalls) * 100 : 0;
        bValue = b.totalBalls > 0 ? (b.totalRuns / b.totalBalls) * 100 : 0;
      } else if (this.sortField === 'dismissals') {
        aValue = a.timesOut;
        bValue = b.timesOut;
      }

      if (this.sortDirection === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });
  }

  sortBy(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
  }
}

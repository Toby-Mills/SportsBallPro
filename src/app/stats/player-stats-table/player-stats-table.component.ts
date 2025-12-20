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
  total50s: number;
  total100s: number;
  timesOut: number;
  totalRunsAgainst: number;
  totalWickets: number;
  totalBowlerBalls: number;
  totalNoBalls: number;
  totalWides: number;
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
            <th rowspan="2" (click)="sortBy('name')" class="sortable">
              Player Name 
              <span *ngIf="sortField === 'name'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th rowspan="2" (click)="sortBy('matches')" class="sortable">
              Matches
              <span *ngIf="sortField === 'matches'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th colspan="7" class="group-header">Batting</th>
            <th colspan="6" class="group-header">Bowling</th>
          </tr>
          <tr>
            <th (click)="sortBy('runs')" class="sortable batting-start">
              Runs
              <span *ngIf="sortField === 'runs'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('avgRuns')" class="sortable">
              Avg
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
            <th (click)="sortBy('50s')" class="sortable">
              50s
              <span *ngIf="sortField === '50s'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('100s')" class="sortable">
              100s
              <span *ngIf="sortField === '100s'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('strikeRate')" class="sortable">
              SR
              <span *ngIf="sortField === 'strikeRate'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('overs')" class="sortable bowling-start">
              Overs
              <span *ngIf="sortField === 'overs'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('runsAgainst')" class="sortable">
              Runs
              <span *ngIf="sortField === 'runsAgainst'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('wickets')" class="sortable">
              Wkts
              <span *ngIf="sortField === 'wickets'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('bowlingAvg')" class="sortable">
              Avg
              <span *ngIf="sortField === 'bowlingAvg'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('extras')" class="sortable">
              Extras
              <span *ngIf="sortField === 'extras'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
            <th (click)="sortBy('economy')" class="sortable">
              Econ
              <span *ngIf="sortField === 'economy'">{{ sortDirection === 'asc' ? '▲' : '▼' }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let player of getSortedPlayers()">
            <td>{{ player.PlayerName }} {{ player.PlayerSurname }}</td>
            <td>{{ player.gameTeamPairs.length }}</td>
            <td class="batting-start">{{ player.totalRuns }}</td>
            <td>{{ (player.timesOut > 0 ? (player.totalRuns / player.timesOut).toFixed(2) : '-') }}</td>
            <td>{{ player.totalFours }}</td>
            <td>{{ player.totalSixes }}</td>
            <td>{{ player.total50s }}</td>
            <td>{{ player.total100s }}</td>
            <td>{{ (player.totalBalls > 0 ? Math.round((player.totalRuns / player.totalBalls) * 100) : '-') }}</td>
            <td class="bowling-start">{{ formatOvers(player.totalBowlerBalls) }}</td>
            <td>{{ player.totalRunsAgainst || '-' }}</td>
            <td>{{ player.totalWickets || '-' }}</td>
            <td>{{ (player.totalWickets > 0 ? (player.totalRunsAgainst / player.totalWickets).toFixed(2) : '-') }}</td>
            <td>{{ (player.totalNoBalls || 0) + (player.totalWides || 0) || '-' }}</td>
            <td>{{ (player.totalBowlerBalls > 0 ? ((player.totalRunsAgainst / player.totalBowlerBalls) * 6).toFixed(2) : '-') }}</td>
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
      vertical-align: bottom;
    }
    th.group-header {
      text-align: center;
      background-color: #e0e0e0;
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
    }
    th.batting-start,
    td.batting-start,
    th.bowling-start,
    td.bowling-start {
      border-left: 2px solid #999;
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

  formatOvers(balls: number): string {
    if (!balls || balls === 0) return '-';
    const completeOvers = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return remainingBalls > 0 ? `${completeOvers}.${remainingBalls}` : `${completeOvers}`;
  }

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
      } else if (this.sortField === '50s') {
        aValue = a.total50s;
        bValue = b.total50s;
      } else if (this.sortField === '100s') {
        aValue = a.total100s;
        bValue = b.total100s;
      } else if (this.sortField === 'strikeRate') {
        aValue = a.totalBalls > 0 ? (a.totalRuns / a.totalBalls) * 100 : 0;
        bValue = b.totalBalls > 0 ? (b.totalRuns / b.totalBalls) * 100 : 0;
      } else if (this.sortField === 'dismissals') {
        aValue = a.timesOut;
        bValue = b.timesOut;
      } else if (this.sortField === 'overs') {
        aValue = a.totalBowlerBalls || 0;
        bValue = b.totalBowlerBalls || 0;
      } else if (this.sortField === 'runsAgainst') {
        // For runs against, lower is better, but blanks (0) should be at bottom
        aValue = a.totalRunsAgainst > 0 ? a.totalRunsAgainst : Infinity;
        bValue = b.totalRunsAgainst > 0 ? b.totalRunsAgainst : Infinity;
      } else if (this.sortField === 'wickets') {
        aValue = a.totalWickets || 0;
        bValue = b.totalWickets || 0;
      } else if (this.sortField === 'bowlingAvg') {
        // For bowling avg, lower is better, but blanks (0) should be at bottom
        aValue = a.totalWickets > 0 ? a.totalRunsAgainst / a.totalWickets : Infinity;
        bValue = b.totalWickets > 0 ? b.totalRunsAgainst / b.totalWickets : Infinity;
      } else if (this.sortField === 'extras') {
        // For extras, lower is better, but blanks (0) should be at bottom
        const aExtras = (a.totalNoBalls || 0) + (a.totalWides || 0);
        const bExtras = (b.totalNoBalls || 0) + (b.totalWides || 0);
        aValue = aExtras > 0 ? aExtras : Infinity;
        bValue = bExtras > 0 ? bExtras : Infinity;
      } else if (this.sortField === 'economy') {
        // For economy, lower is better, but blanks (0) should be at bottom
        aValue = a.totalBowlerBalls > 0 ? (a.totalRunsAgainst / a.totalBowlerBalls) * 6 : Infinity;
        bValue = b.totalBowlerBalls > 0 ? (b.totalRunsAgainst / b.totalBowlerBalls) * 6 : Infinity;
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

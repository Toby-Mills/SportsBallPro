import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Fixture } from '../../models/web-sports';
import { Player } from '../../models/player';
import { FixtureSearchService } from '../../services/fixture-search.service';
import { PlayerAggregationService } from '../../services/player-aggregation.service';
import { StatsStateService } from '../../services/stats-state.service';
import { TeamSearchComponent } from '../team-search/team-search.component';
import { YearFilterComponent } from '../year-filter/year-filter.component';
import { FixtureSelectorComponent } from '../fixture-selector/fixture-selector.component';
import { PlayerStatsTableComponent } from '../player-stats-table/player-stats-table.component';

@Component({
  selector: 'app-stats-container',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TeamSearchComponent,
    YearFilterComponent,
    FixtureSelectorComponent,
    PlayerStatsTableComponent
  ],
  template: `
    <div class="header">
      <img src="https://www.websports.co.za/images/logos/small_wynberg.png" alt="Logo" class="logo">
      <h1>Wynberg BHS Cricket Matches</h1>
    </div>
    
    <app-team-search (teamSelected)="onTeamSelected($event)"></app-team-search>
    
    <app-year-filter 
      *ngIf="selectedTeam"
      [team]="selectedTeam"
      (yearSelected)="onYearSelected($event)">
    </app-year-filter>
    
    <app-fixture-selector
      *ngIf="selectedTeam && selectedYear"
      [team]="selectedTeam"
      [year]="selectedYear"
      [fixtures]="selectedYearFixtures"
      [selectedFixtures]="selectedFixtures"
      (fixturesSelected)="onFixturesSelected($event)"
      (analyzeRequested)="onAnalyzeRequested($event)">
    </app-fixture-selector>
    
    <app-player-stats-table
      *ngIf="aggregatedPlayers.length > 0"
      [players]="aggregatedPlayers">
    </app-player-stats-table>
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
export class StatsContainerComponent implements OnInit, OnDestroy {
  selectedTeam: string = '';
  selectedYear: number | null = null;
  selectedFixtures: Fixture[] = [];
  selectedYearFixtures: Fixture[] = [];
  aggregatedPlayers: any[] = [];

  constructor(
    private fixtureSearch: FixtureSearchService,
    private playerAggregation: PlayerAggregationService,
    private statsState: StatsStateService
  ) {}

  ngOnInit() {
    const saved = this.statsState.getState();
    if (saved) {
      this.selectedTeam = saved.selectedTeamName || '';
      this.selectedYear = saved.selectedYear || null;
      this.selectedYearFixtures = (saved.selectedYearFixtures as Fixture[]) || [];
      
      // Restore selected fixtures from gameID strings
      const savedSelectedIds = saved.selectedFixturesForStats || [];
      if (Array.isArray(savedSelectedIds) && savedSelectedIds.length > 0) {
        const idSet = new Set(savedSelectedIds);
        this.selectedFixtures = this.selectedYearFixtures.filter(f => idSet.has(f.gameID));
      }
      
      // If we have team and year but no fixtures loaded yet, fetch them
      if (this.selectedTeam && this.selectedYear && this.selectedYearFixtures.length === 0) {
        this.loadFixturesForYear();
      }
      
      // Rebuild stats if fixtures are selected
      if (this.selectedFixtures.length > 0) {
        this.rebuildStats();
      }
    }
  }

  ngOnDestroy() {
    // Cleanup if needed
  }

  onTeamSelected(team: string) {
    this.selectedTeam = team;
    this.selectedYear = null;
    this.selectedFixtures = [];
    this.selectedYearFixtures = [];
    this.aggregatedPlayers = [];
    this.saveState();
  }

  onYearSelected(year: number) {
    this.selectedYear = year;
    this.selectedFixtures = [];
    this.aggregatedPlayers = [];
    this.loadFixturesForYear();
    this.saveState();
  }

  onFixturesSelected(fixtures: Fixture[]) {
    this.selectedFixtures = fixtures;
    this.saveState();
  }

  onAnalyzeRequested(fixtures: Fixture[]) {
    this.selectedFixtures = fixtures;
    this.saveState();
    this.rebuildStats();
  }

  private loadFixturesForYear() {
    if (this.selectedTeam && this.selectedYear) {
      this.fixtureSearch.getFixtures(this.selectedTeam, this.selectedYear).subscribe(
        (fixtures: Fixture[]) => {
          this.selectedYearFixtures = fixtures;
        },
        (error: any) => console.error('Error loading fixtures:', error)
      );
    }
  }

  private rebuildStats() {
    if (this.selectedFixtures.length > 0) {
      this.playerAggregation.aggregateStats(
        this.selectedFixtures,
        this.selectedTeam
      ).subscribe(
        (players: any[]) => {
          this.aggregatedPlayers = players;
        },
        (error: any) => {
          console.error('Error aggregating players:', error);
        }
      );
    } else {
      this.aggregatedPlayers = [];
    }
  }

  private saveState() {
    this.statsState.setState({
      selectedTeamName: this.selectedTeam,
      selectedYear: this.selectedYear,
      selectedYearFixtures: this.selectedYearFixtures,
      selectedFixturesForStats: this.selectedFixtures.map(f => f.gameID)
    });
  }
}

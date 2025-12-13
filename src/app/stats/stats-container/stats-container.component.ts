import { Component, OnInit, OnDestroy, Input } from '@angular/core';
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
    <app-team-search 
      [prefilterTeam]="prefilterTeam"
      [showSearchBox]="showTeamSearch"
      (teamSelected)="onTeamSelected($event)">
    </app-team-search>
    
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
      (fixturesSelected)="onFixturesSelected($event)">

    </app-fixture-selector>
    
    <div class="analyze-container" *ngIf="selectedTeam && selectedYear">
      <button 
        class="analyze-button"
        [disabled]="selectedFixtures.length === 0"
        (click)="onAnalyzeRequested()">
        Analyze Selected Fixtures
      </button>
    </div>
    
    <app-player-stats-table
      *ngIf="aggregatedPlayers.length > 0"
      [players]="aggregatedPlayers">
    </app-player-stats-table>
  `,
	styles: [`
    .analyze-container {
      margin: 20px 0;
      padding: 0 20px;
    }
    
    .analyze-button {
      padding: 10px 20px;
      background-color: #28a745;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 1em;
      font-weight: bold;
      display: block;
      width: 100%;
      max-width: 300px;
    }
    
    .analyze-button:hover:not(:disabled) {
      background-color: #218838;
    }
    
    .analyze-button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
      opacity: 0.6;
    }`
	]
})
export class StatsContainerComponent implements OnInit, OnDestroy {
	@Input() prefilterTeam?: string;
	@Input() showTeamSearch: boolean = true;

	selectedTeam: string = '';
	selectedYear: number | null = null;
	selectedFixtures: Fixture[] = [];
	selectedYearFixtures: Fixture[] = [];
	aggregatedPlayers: any[] = [];

	constructor(
		private fixtureSearch: FixtureSearchService,
		private playerAggregation: PlayerAggregationService,
		private statsState: StatsStateService
	) { }

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

	onAnalyzeRequested() {
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

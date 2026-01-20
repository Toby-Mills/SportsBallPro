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
	templateUrl: './stats-container.component.html',
	styleUrl: './stats-container.component.css'
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

			// If we have a team, trigger a search to populate the cache
			// This ensures year-filter component can call getYears() successfully
			if (this.selectedTeam) {
				this.fixtureSearch.searchByTerm(this.selectedTeam);
			}

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

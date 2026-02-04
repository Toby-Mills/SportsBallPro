import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatchKeyService } from '../../services/match-key.service';
import { StatsStateService } from '../../services/stats-state.service';
import { WebSportsAPIService } from '../../services/web-sports-api.service';
import { FixtureSearchService } from '../../services/fixture-search.service';
import { Fixtures } from '../../models/fixtures';
import { Fixture } from '../../models/match';
import { PlayerLineup } from '../../models/batting-innings-detail';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class StatsComponent implements OnInit {
  teamNameSearch: string = '';
  teamSearchFixtures: Fixtures = new Fixtures();
  teamNamesFromSearch: string[] = [];
  selectedTeamName: string = '';
  selectedTeamFixtures: Fixture[] = [];
  uniqueYears: number[] = [];
  selectedYear: number | null = null;
  selectedYearFixtures: Fixture[] = [];
  selectedFixturesForStats: Fixture[] = [];
  allPlayers: Map<string, any> = new Map();
  selectedPlayer: any = null;

  constructor(
    private webSportsAPI: WebSportsAPIService,
    private matchKey: MatchKeyService,
    private statsState: StatsStateService,
    private fixtureSearchService: FixtureSearchService) { }

  ngOnInit(): void {
    // Try to restore saved state (if the user is returning from the match view)
    const saved = this.statsState.getState();
    if (saved) {
      this.teamNameSearch = saved.teamNameSearch || '';
      this.teamNamesFromSearch = saved.teamNamesFromSearch || [];
      this.selectedTeamName = saved.selectedTeamName || '';
      this.selectedTeamFixtures = saved.selectedTeamFixtures || [];
      this.uniqueYears = saved.uniqueYears || [];
      this.selectedYear = (typeof saved.selectedYear !== 'undefined') ? saved.selectedYear : null;
      this.selectedYearFixtures = saved.selectedYearFixtures || [];
      
      // Restore selectedFixturesForStats from saved gameId strings
      const savedGameIds = saved.selectedFixturesForStats || [];
      if (savedGameIds.length > 0) {
        const ids = new Set(savedGameIds);
        // Prefer matching against selectedYearFixtures, then selectedTeamFixtures
        this.selectedFixturesForStats = (this.selectedYearFixtures || []).filter(f => ids.has(f.gameId));
        if (this.selectedFixturesForStats.length === 0) {
          this.selectedFixturesForStats = (this.selectedTeamFixtures || []).filter(f => ids.has(f.gameId));
        }
      } else {
        this.selectedFixturesForStats = [];
      }

      // If fixtures were selected previously, fetch players again to rebuild the table
      if (this.selectedFixturesForStats.length > 0) {
        this.rebuildStatsTable();
      }
    }
  }

  searchTeam() {
    this.loadFixtures(this.teamNameSearch);
  }

  loadFixtures(teamName: string) {
    const lowerCaseTeamName = teamName.toLowerCase();

    // Use fixtureSearchService which returns internal Fixture[] models
    this.fixtureSearchService.searchByTerm(teamName).subscribe(
      fixtures => {
        this.teamSearchFixtures = new Fixtures();
        this.teamSearchFixtures.fixtures = fixtures;
        
        const teamNamesSet = new Set<string>();

        for (let fixture of this.teamSearchFixtures.fixtures) {
          if (fixture.teamAName.toLowerCase().includes(lowerCaseTeamName)) {
            teamNamesSet.add(fixture.teamAName);
          }
          if (fixture.teamBName.toLowerCase().includes(lowerCaseTeamName)) {
            teamNamesSet.add(fixture.teamBName);
          }
        }

        this.teamNamesFromSearch = Array.from(teamNamesSet).sort();
      }
    );
  }

  onTeamSelect() {
    this.selectedTeamFixtures = this.teamSearchFixtures.fixtures.filter(fixture =>
      fixture.teamAName === this.selectedTeamName || fixture.teamBName === this.selectedTeamName
    );

    const yearsSet = new Set<number>();
    for (let fixture of this.selectedTeamFixtures) {
      const year = new Date(fixture.datePlayed).getFullYear();
      yearsSet.add(year);
    }

    this.uniqueYears = Array.from(yearsSet).sort((a, b) => b - a); // Sort in descending order
  }

  onYearSelect() {
    if (this.selectedYear !== null) {
      const selectedYearNumber = Number(this.selectedYear);
      this.selectedYearFixtures = this.selectedTeamFixtures.filter(fixture => {
        const fixtureYear = new Date(fixture.datePlayed).getFullYear();
        return fixtureYear === selectedYearNumber;
      }).sort((a, b) => new Date(a.datePlayed).getTime() - new Date(b.datePlayed).getTime()); // Sort in chronological order

      // Select all fixtures by default
      this.selectedFixturesForStats = [...this.selectedYearFixtures];

      // Rebuild the stats table
      this.rebuildStatsTable();
    }
  }

  onFixtureSelect(fixture: Fixture, event: any) {
    const isChecked = !!event.target.checked;
    const idx = this.selectedFixturesForStats.findIndex(f => f.gameId === fixture.gameId);
    if (isChecked) {
      if (idx === -1) {
        this.selectedFixturesForStats.push(fixture);
      }
    } else {
      if (idx > -1) {
        this.selectedFixturesForStats.splice(idx, 1);
      }
    }

    // Rebuild the stats table
    this.rebuildStatsTable();
  }

  isSelected(fixture: any): boolean {
    return this.selectedFixturesForStats.some((f: Fixture) => f.gameId === fixture.gameId);
  }

  getPlayersForFixture(fixture: Fixture) {
    this.webSportsAPI.getFixtures(fixture.gameId, 1).subscribe(
      fixtureDetails => {
        const teamAId = fixtureDetails.fixtures[0].aTeamID;
        const teamBId = fixtureDetails.fixtures[0].bTeamID;

        if (fixture.teamAName === this.selectedTeamName) {
          this.fetchPlayers(fixture.gameId, teamAId);
        }

        if (fixture.teamBName === this.selectedTeamName) {
          this.fetchPlayers(fixture.gameId, teamBId);
        }
      }
    );
  }

  fetchPlayers(gameId: string, teamId: string) {
    this.webSportsAPI.getBattingLineup(gameId, teamId, 1).subscribe(
      (apiBattingLineup) => {
        const battingLineup = new PlayerLineup();
        battingLineup.loadFromAPI(apiBattingLineup);
        battingLineup.lineup.forEach(player => this.addPlayer(player, gameId, teamId, true));
      }
    );

    this.webSportsAPI.getBowlingLineup(gameId, teamId, 1).subscribe(
      (apiBowlingLineup) => {
        const bowlingLineup = new PlayerLineup();
        bowlingLineup.loadFromAPI(apiBowlingLineup);
        bowlingLineup.lineup.forEach(player => this.addPlayer(player, gameId, teamId, false));
      }
    );
  }

  addPlayer(player: any, gameId: string, teamId: string, isBatter: boolean) {
    const playerKey = `${player.firstName} ${player.surname}`;
    if (this.allPlayers.has(playerKey)) {
      const existingPlayer = this.allPlayers.get(playerKey);
      const gameTeamPairExists = existingPlayer.gameTeamPairs.some(
        (pair: { gameId: string; teamId: string }) => pair.gameId === gameId && pair.teamId === teamId
      );
      if (!gameTeamPairExists) {
        existingPlayer.gameTeamPairs.push({ gameId, teamId });
      }
      if (isBatter) {
        existingPlayer.battingGames.add(gameId);
      }
    } else {
      this.allPlayers.set(playerKey, {
        ...player,
        gameTeamPairs: [{ gameId, teamId }],
        battingGames: isBatter ? new Set([gameId]) : new Set()
      });
    }
  }

  rebuildStatsTable() {
    // Clear the allPlayers map before adding new players
    this.allPlayers.clear();

    // Loop through all selected fixtures and retrieve players
    this.selectedFixturesForStats.forEach(fixture => {
      this.getPlayersForFixture(fixture);
    });
  }

  selectPlayer(player: any, event: Event) {
    event.preventDefault();
    this.selectedPlayer = player;
  }

  getSortedPlayers() {
    return Array.from(this.allPlayers.values()).sort((a, b) => {
      const nameA = `${a.PlayerName} ${a.PlayerSurname}`.toLowerCase();
      const nameB = `${b.PlayerName} ${b.PlayerSurname}`.toLowerCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });
  }

  /**
   * Return the match key used by the Home component (hash + gameID)
   */
  getMatchKey(fixture: Fixture): string {
    // web-sports Fixture uses `gameId` as the identifier
    return this.matchKey.generateKey(fixture.gameId);
  }

  /** Save current component state so it can be restored when returning from match view */
  saveState(): void {
    const state = {
      teamNameSearch: this.teamNameSearch,
      teamNamesFromSearch: this.teamNamesFromSearch,
      selectedTeamName: this.selectedTeamName,
      selectedTeamFixtures: this.selectedTeamFixtures,
      uniqueYears: this.uniqueYears,
      selectedYear: this.selectedYear,
      selectedYearFixtures: this.selectedYearFixtures,
      // store only the gameId values for selected fixtures to avoid reference equality issues
      selectedFixturesForStats: this.selectedFixturesForStats.map(f => f.gameId)
    };

    this.statsState.setState(state);
  }
}

import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatchKeyService } from '../../services/match-key.service';
import { StatsStateService } from '../../services/stats-state.service';
import { WebSportsAPIService } from '../../services/web-sports-api.service';
import { BattingLineup, BowlingLineup, Fixture, Fixtures } from '../../models/web-sports';

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
    private http: HttpClient,
    private webSportsAPI: WebSportsAPIService,
    private matchKey: MatchKeyService,
    private statsState: StatsStateService) { }

  ngOnInit(): void {
    // Try to restore saved state (if the user is returning from the match view)
    const saved = this.statsState.getState();
    if (saved) {
      this.teamNameSearch = saved.teamNameSearch || '';
      this.teamNamesFromSearch = saved.teamNamesFromSearch || [];
      this.selectedTeamName = saved.selectedTeamName || '';
      this.selectedTeamFixtures = (saved.selectedTeamFixtures as Fixture[]) || [];
      this.uniqueYears = saved.uniqueYears || [];
      this.selectedYear = (typeof saved.selectedYear !== 'undefined') ? saved.selectedYear : null;
      this.selectedYearFixtures = (saved.selectedYearFixtures as Fixture[]) || [];
      // selectedFixturesForStats may have been saved as an array of gameID strings or as fixtures
      const savedSelected = saved.selectedFixturesForStats || [];
      if (savedSelected.length > 0) {
        if (typeof savedSelected[0] === 'string') {
          const ids = new Set(savedSelected as string[]);
          // Prefer matching against selectedYearFixtures, then selectedTeamFixtures
          this.selectedFixturesForStats = (this.selectedYearFixtures || []).filter(f => ids.has(f.gameID));
          if ((this.selectedFixturesForStats || []).length === 0) {
            this.selectedFixturesForStats = (this.selectedTeamFixtures || []).filter(f => ids.has(f.gameID));
          }
        } else {
          this.selectedFixturesForStats = (savedSelected as Fixture[]) || [];
        }
      } else {
        this.selectedFixturesForStats = [];
      }

      // If fixtures were selected previously, fetch players again to rebuild the table
      if (this.selectedFixturesForStats && this.selectedFixturesForStats.length > 0) {
        this.rebuildStatsTable();
      }
    }
  }

  searchTeam() {
    this.loadFixtures(this.teamNameSearch);
  }

  loadFixtures(teamName: string) {
    const lowerCaseTeamName = teamName.toLowerCase();

    this.webSportsAPI.getFixturesByTeamName(teamName).subscribe(
      fixtures => {
        this.teamSearchFixtures = fixtures;
        const teamNamesSet = new Set<string>();

        for (let fixture of this.teamSearchFixtures.fixtures) {
          if (fixture.aTeam.toLowerCase().includes(lowerCaseTeamName)) {
            teamNamesSet.add(fixture.aTeam);
          }
          if (fixture.bTeam.toLowerCase().includes(lowerCaseTeamName)) {
            teamNamesSet.add(fixture.bTeam);
          }
        }

        this.teamNamesFromSearch = Array.from(teamNamesSet).sort();
      }
    );
  }

  onTeamSelect() {
    this.selectedTeamFixtures = this.teamSearchFixtures.fixtures.filter(fixture =>
      fixture.aTeam === this.selectedTeamName || fixture.bTeam === this.selectedTeamName
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
    const idx = this.selectedFixturesForStats.findIndex(f => f.gameID === fixture.gameID);
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
    return this.selectedFixturesForStats.some((f: Fixture) => f.gameID === fixture.gameID);
  }

  getPlayersForFixture(fixture: Fixture) {
    this.webSportsAPI.getFixtures(fixture.gameID, 1).subscribe(
      fixtureDetails => {
        const teamAId = fixtureDetails.fixtures[0].aTeamID;
        const teamBId = fixtureDetails.fixtures[0].bTeamID;

        if (fixture.aTeam === this.selectedTeamName) {
          this.fetchPlayers(fixture.gameID, teamAId);
        }

        if (fixture.bTeam === this.selectedTeamName) {
          this.fetchPlayers(fixture.gameID, teamBId);
        }
      }
    );
  }

  fetchPlayers(gameId: string, teamId: string) {
    this.webSportsAPI.getBattingLineup(gameId, teamId, 1).subscribe(
      (battingLineup: BattingLineup) => {
        battingLineup.team.forEach(player => this.addPlayer(player, gameId, teamId, true));
      }
    );

    this.webSportsAPI.getBowlingLineup(gameId, teamId, 1).subscribe(
      (bowlingLineup: BowlingLineup) => {
        bowlingLineup.team.forEach(player => this.addPlayer(player, gameId, teamId, false));
      }
    );
  }

  addPlayer(player: any, gameId: string, teamId: string, isBatter: boolean) {
    const playerKey = `${player.PlayerName} ${player.PlayerSurname}`;
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
    // web-sports Fixture uses `gameID` as the identifier
    return this.matchKey.generateKey(fixture.gameID);
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
      // store only the gameID values for selected fixtures to avoid reference equality issues
      selectedFixturesForStats: this.selectedFixturesForStats.map(f => f.gameID)
    };

    this.statsState.setState(state);
  }
}

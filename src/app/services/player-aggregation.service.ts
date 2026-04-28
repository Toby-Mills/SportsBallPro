import { Injectable } from '@angular/core';
import { Fixture } from '../models/match';
import { WebSportsAPIService } from './web-sports-api.service';
import { Observable, forkJoin, of } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';

export interface AggregatedPlayer {
  PlayerName: string;
  PlayerSurname: string;
  gameTeamPairs: Array<{ gameId: string; teamId: string; inningsNumber: number }>;
  battingGames: Set<string>;
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

@Injectable({
  providedIn: 'root'
})
export class PlayerAggregationService {
  constructor(private webSportsAPI: WebSportsAPIService) {}

  /**
   * Aggregate player statistics across selected fixtures
   * Returns an Observable of players who played for the given team in those fixtures
   */
  aggregateStats(fixtures: Fixture[], selectedTeam: string): Observable<AggregatedPlayer[]> {
    if (fixtures.length === 0) {
      return of([]);
    }

    // Create an array of observables for each fixture's lineups, for both innings
    const lineupObservables = fixtures.flatMap((fixture: Fixture) => {
      const teamId = fixture.teamAName === selectedTeam ? fixture.teamAId : fixture.teamBId;
      if (!teamId) {
        return [];
      }

      // Retrieve both innings (1 and 2) for batting and bowling
      const inningsNumbers = [1, 2];
      return inningsNumbers.flatMap((inningsNumber) => [
        this.webSportsAPI.getBattingScorecard(fixture.gameId, teamId, inningsNumber as 1 | 2).pipe(
          mergeMap((battingScorecard: any) => {
            return of({ fixture, teamId, inningsNumber, players: battingScorecard.scorecard, isBatter: true });
          })
        ),
        this.webSportsAPI.getBowlingScorecard(fixture.gameId, teamId, inningsNumber as 1 | 2).pipe(
          mergeMap((bowlingScorecard: any) => {
            return of({ fixture, teamId, inningsNumber, players: bowlingScorecard.scorecard, isBatter: false });
          })
        )
      ]);
    });

    // Combine all lineup observables and aggregate
    if (lineupObservables.length === 0) {
      return of([]);
    }

    return forkJoin(lineupObservables).pipe(
      mergeMap((lineups: any[]) => {
        const playerMap = new Map<string, AggregatedPlayer>();

        lineups.forEach((lineupData: any) => {
          const { fixture, teamId, inningsNumber, players, isBatter } = lineupData;
          players.forEach((player: any) => {
            this.addPlayerToMap(playerMap, player, fixture.gameId, teamId, inningsNumber, isBatter);
          });
        });

        const result = Array.from(playerMap.values());
        return of(result);
      })
    );
  }

  /**
   * Add a player to the aggregation map, or update existing entry
   * Uses player name as the unique identifier across matches (PlayerID is match-specific)
   */
  private addPlayerToMap(
    playerMap: Map<string, AggregatedPlayer>,
    player: any,
    gameId: string,
    teamId: string,
    inningsNumber: number,
    isBatter: boolean
  ) {
    // Use name as the unique key since PlayerID is match-specific
    const playerKey = `${player.PlayerName} ${player.PlayerSurname}`;

    if (!playerMap.has(playerKey)) {
      const runs = isBatter ? (player.BatRuns || 0) : 0;
      const balls = isBatter ? (player.BatBalls || 0) : 0;
      // Player is out unless HowOut is "Not Out" or "Did Not Bat"
      const howOut = (player.HowOut || '').trim();
      const isNotOut = howOut.toLowerCase() === 'not out' || howOut.toLowerCase() === 'did not bat';
      const timesOut = isBatter && !isNotOut && howOut.length > 0 ? 1 : 0;
      const is50 = isBatter && runs >= 50 && runs < 100 ? 1 : 0;
      const is100 = isBatter && runs >= 100 ? 1 : 0;

      playerMap.set(playerKey, {
        PlayerName: player.PlayerName,
        PlayerSurname: player.PlayerSurname,
        gameTeamPairs: [{ gameId, teamId, inningsNumber }],
        battingGames: isBatter ? new Set([gameId]) : new Set(),
        totalRuns: runs,
        totalBalls: balls,
        totalFours: isBatter ? (player.BatFours || 0) : 0,
        totalSixes: isBatter ? (player.BatSixes || 0) : 0,
        total50s: is50,
        total100s: is100,
        timesOut: timesOut,
        totalRunsAgainst: !isBatter ? (player.RunsAgainst || 0) : 0,
        totalWickets: !isBatter ? (player.Wickets || 0) : 0,
        totalBowlerBalls: !isBatter ? (player.TotalBowlerBalls || 0) : 0,
        totalNoBalls: !isBatter ? (player.NoBalls || 0) : 0,
        totalWides: !isBatter ? (player.Wides || 0) : 0
      });
    } else {
      const existing = playerMap.get(playerKey)!;
      const gameTeamPairExists = existing.gameTeamPairs.some(
        (pair) => pair.gameId === gameId && pair.teamId === teamId && pair.inningsNumber === inningsNumber
      );

      if (!gameTeamPairExists) {
        existing.gameTeamPairs.push({ gameId, teamId, inningsNumber });
      }
      
      if (isBatter) {
        existing.battingGames.add(gameId);
        
        // Aggregate batting stats
        const runs = player.BatRuns || 0;
        const balls = player.BatBalls || 0;
        existing.totalRuns += runs;
        existing.totalBalls += balls;
        existing.totalFours += (player.BatFours || 0);
        existing.totalSixes += (player.BatSixes || 0);
        
        // Count 50s and 100s
        if (runs >= 100) {
          existing.total100s += 1;
        } else if (runs >= 50) {
          existing.total50s += 1;
        }
        
        // Player is out unless HowOut is "Not Out" or "Did Not Bat"
        const howOut = (player.HowOut || '').trim();
        const isNotOut = howOut.toLowerCase() === 'not out' || howOut.toLowerCase() === 'did not bat';
        if (!isNotOut && howOut.length > 0) {
          existing.timesOut += 1;
        }
      } else {
        // Aggregate bowling stats
        existing.totalRunsAgainst += (player.RunsAgainst || 0);
        existing.totalWickets += (player.Wickets || 0);
        existing.totalBowlerBalls += (player.TotalBowlerBalls || 0);
        existing.totalNoBalls += (player.NoBalls || 0);
        existing.totalWides += (player.Wides || 0);
      }
    }
  }
}

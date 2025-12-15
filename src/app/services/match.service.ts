import { Injectable } from '@angular/core';
import { Fixture, Match, PlayerLineup, Status } from '../models/match';
import { WebSportsAPIService } from './web-sports-api.service';
import { BehaviorSubject, catchError, concatMap, map, Observable, of, throwError } from 'rxjs';
import { TeamScore } from '../models/team-score';
import { InningsDetail } from '../models/innings-detail';
import { RunComparison, RunComparisonFactory } from '../models/run-comparison';
import { BattingScorecard, BowlingScorecard } from '../models/scorecard';
import { RecentBalls } from '../models/recent-balls';
import { FallOfWickets } from '../models/fall-of-wickets';
import { WagonWheel } from '../models/wagon-wheel';
import { HttpErrorResponse } from '@angular/common/http';
import { ToasterMessageService } from './toaster-message.service';

@Injectable({
  providedIn: 'root'
})
export class MatchService {
  // Map-based storage for multiple matches
  private matches = new Map<string, Match>();
  private fixtureSubjects = new Map<string, BehaviorSubject<Fixture>>();
  private statusSubjects = new Map<string, BehaviorSubject<Status>>();
  private teamAScoreSubjects = new Map<string, BehaviorSubject<TeamScore>>();
  private teamBScoreSubjects = new Map<string, BehaviorSubject<TeamScore>>();
  private teamAbattingScorecardSubjects = new Map<string, BehaviorSubject<BattingScorecard>>();
  private teamBbattingScorecardSubjects = new Map<string, BehaviorSubject<BattingScorecard>>();
  private teamABowlingScorecardSubjects = new Map<string, BehaviorSubject<BowlingScorecard>>();
  private teamBBowlingScorecardSubjects = new Map<string, BehaviorSubject<BowlingScorecard>>();
  private innings1RecentOversSubjects = new Map<string, BehaviorSubject<RecentBalls>>();
  private innings2RecentOversSubjects = new Map<string, BehaviorSubject<RecentBalls>>();
  private innings1FallOfWicketsSubjects = new Map<string, BehaviorSubject<FallOfWickets>>();
  private innings2FallOfWicketsSubjects = new Map<string, BehaviorSubject<FallOfWickets>>();
  private runComparisonSubjects = new Map<string, BehaviorSubject<RunComparison>>();
  private wagonWheelSubjects = new Map<string, BehaviorSubject<WagonWheel>>();
  private teamABattingLineupSubjects = new Map<string, BehaviorSubject<PlayerLineup>>();
  private teamBBattingLineupSubjects = new Map<string, BehaviorSubject<PlayerLineup>>();
  private teamABowlingLineupSubjects = new Map<string, BehaviorSubject<PlayerLineup>>();
  private teamBBowlingLineupSubjects = new Map<string, BehaviorSubject<PlayerLineup>>();
  private inningsChangeSubjects = new Map<string, BehaviorSubject<1 | 2>>();
  
  // Wagon wheel state per match
  private wagonWheelState = new Map<string, { teamId: string, playerId: number, type: 'Batting' | 'Bowling' }>();

  constructor(public webSportsApi: WebSportsAPIService, private toasterMessage: ToasterMessageService) { }

  /**
   * Get observable for fixture updates for a specific match
   */
  getFixtureUpdates(gameId: string): Observable<Fixture> {
    return this.getOrCreateSubject(this.fixtureSubjects, gameId, new Fixture()).asObservable();
  }

  getStatusUpdates(gameId: string): Observable<Status> {
    return this.getOrCreateSubject(this.statusSubjects, gameId, new Status()).asObservable();
  }

  getTeamAScoreUpdates(gameId: string): Observable<TeamScore> {
    return this.getOrCreateSubject(this.teamAScoreSubjects, gameId, new TeamScore()).asObservable();
  }

  getTeamBScoreUpdates(gameId: string): Observable<TeamScore> {
    return this.getOrCreateSubject(this.teamBScoreSubjects, gameId, new TeamScore()).asObservable();
  }

  getTeamABattingScorecardUpdates(gameId: string): Observable<BattingScorecard> {
    return this.getOrCreateSubject(this.teamAbattingScorecardSubjects, gameId, new BattingScorecard()).asObservable();
  }

  getTeamBBattingScorecardUpdates(gameId: string): Observable<BattingScorecard> {
    return this.getOrCreateSubject(this.teamBbattingScorecardSubjects, gameId, new BattingScorecard()).asObservable();
  }

  getTeamABowlingScorecardUpdates(gameId: string): Observable<BowlingScorecard> {
    return this.getOrCreateSubject(this.teamABowlingScorecardSubjects, gameId, new BowlingScorecard()).asObservable();
  }

  getTeamBBowlingScorecardUpdates(gameId: string): Observable<BowlingScorecard> {
    return this.getOrCreateSubject(this.teamBBowlingScorecardSubjects, gameId, new BowlingScorecard()).asObservable();
  }

  getInnings1RecentOversUpdates(gameId: string): Observable<RecentBalls> {
    return this.getOrCreateSubject(this.innings1RecentOversSubjects, gameId, new RecentBalls()).asObservable();
  }

  getInnings2RecentOversUpdates(gameId: string): Observable<RecentBalls> {
    return this.getOrCreateSubject(this.innings2RecentOversSubjects, gameId, new RecentBalls()).asObservable();
  }

  getInnings1FallOfWicketsUpdates(gameId: string): Observable<FallOfWickets> {
    return this.getOrCreateSubject(this.innings1FallOfWicketsSubjects, gameId, new FallOfWickets()).asObservable();
  }

  getInnings2FallOfWicketsUpdates(gameId: string): Observable<FallOfWickets> {
    return this.getOrCreateSubject(this.innings2FallOfWicketsSubjects, gameId, new FallOfWickets()).asObservable();
  }

  getRunComparisonUpdates(gameId: string): Observable<RunComparison> {
    return this.getOrCreateSubject(this.runComparisonSubjects, gameId, new RunComparison()).asObservable();
  }

  getWagonWheelUpdates(gameId: string): Observable<WagonWheel> {
    return this.getOrCreateSubject(this.wagonWheelSubjects, gameId, new WagonWheel()).asObservable();
  }

  getTeamABattingLineupUpdates(gameId: string): Observable<PlayerLineup> {
    return this.getOrCreateSubject(this.teamABattingLineupSubjects, gameId, new PlayerLineup()).asObservable();
  }

  getTeamBBattingLineupUpdates(gameId: string): Observable<PlayerLineup> {
    return this.getOrCreateSubject(this.teamBBattingLineupSubjects, gameId, new PlayerLineup()).asObservable();
  }

  getTeamABowlingLineupUpdates(gameId: string): Observable<PlayerLineup> {
    return this.getOrCreateSubject(this.teamABowlingLineupSubjects, gameId, new PlayerLineup()).asObservable();
  }

  getTeamBBowlingLineupUpdates(gameId: string): Observable<PlayerLineup> {
    return this.getOrCreateSubject(this.teamBBowlingLineupSubjects, gameId, new PlayerLineup()).asObservable();
  }

  getInningsChangeUpdates(gameId: string): Observable<1 | 2> {
    return this.getOrCreateSubject(this.inningsChangeSubjects, gameId, 1 as 1 | 2).asObservable();
  }

  /**
   * Helper to get or create a BehaviorSubject for a specific gameId
   */
  private getOrCreateSubject<T>(map: Map<string, BehaviorSubject<T>>, gameId: string, initialValue: T): BehaviorSubject<T> {
    if (!map.has(gameId)) {
      map.set(gameId, new BehaviorSubject<T>(initialValue));
    }
    return map.get(gameId)!;
  }

  /**
   * Get or create Match instance for gameId
   */
  private getOrCreateMatch(gameId: string): Match {
    if (!this.matches.has(gameId)) {
      this.matches.set(gameId, new Match());
    }
    return this.matches.get(gameId)!;
  }

  /**
   * Load match data - checks cache first, only loads from API if not cached
   */
  public loadMatch(gameId: string) {
    // If match is already cached, emit cached data and skip API calls
    if (this.matches.has(gameId)) {
      // Defer emission to next tick to allow subscriptions to be set up
      setTimeout(() => this.emitCachedData(gameId), 0);
      return;
    }

    // Not cached, load from API
    this.reloadMatchData(gameId);
  }

  /**
   * Emit all cached data for a match
   */
  private emitCachedData(gameId: string) {
    const match = this.matches.get(gameId);
    if (!match) return;

    this.getOrCreateSubject(this.fixtureSubjects, gameId, new Fixture()).next(match.fixture);
    this.getOrCreateSubject(this.statusSubjects, gameId, new Status()).next(match.status);
    this.getOrCreateSubject(this.teamAScoreSubjects, gameId, new TeamScore()).next(match.teamAScore);
    this.getOrCreateSubject(this.teamBScoreSubjects, gameId, new TeamScore()).next(match.teamBScore);
    this.getOrCreateSubject(this.teamAbattingScorecardSubjects, gameId, new BattingScorecard()).next(match.innings1Detail.battingScorecard);
    this.getOrCreateSubject(this.teamBbattingScorecardSubjects, gameId, new BattingScorecard()).next(match.innings2Detail.battingScorecard);
    this.getOrCreateSubject(this.teamABowlingScorecardSubjects, gameId, new BowlingScorecard()).next(match.innings2Detail.bowlingScorecard);
    this.getOrCreateSubject(this.teamBBowlingScorecardSubjects, gameId, new BowlingScorecard()).next(match.innings1Detail.bowlingScorecard);
    this.getOrCreateSubject(this.innings1RecentOversSubjects, gameId, new RecentBalls()).next(match.innings1Detail.recentOvers);
    this.getOrCreateSubject(this.innings2RecentOversSubjects, gameId, new RecentBalls()).next(match.innings2Detail.recentOvers);
    this.getOrCreateSubject(this.innings1FallOfWicketsSubjects, gameId, new FallOfWickets()).next(match.innings1Detail.fallOfWickets);
    this.getOrCreateSubject(this.innings2FallOfWicketsSubjects, gameId, new FallOfWickets()).next(match.innings2Detail.fallOfWickets);
    this.getOrCreateSubject(this.runComparisonSubjects, gameId, new RunComparison()).next(match.runComparison);
    this.getOrCreateSubject(this.wagonWheelSubjects, gameId, new WagonWheel()).next(match.wagonWheel);
    this.getOrCreateSubject(this.teamABattingLineupSubjects, gameId, new PlayerLineup()).next(match.teamABattingLineup);
    this.getOrCreateSubject(this.teamBBattingLineupSubjects, gameId, new PlayerLineup()).next(match.teamBBattingLineup);
    this.getOrCreateSubject(this.teamABowlingLineupSubjects, gameId, new PlayerLineup()).next(match.teamABowlingLineup);
    this.getOrCreateSubject(this.teamBBowlingLineupSubjects, gameId, new PlayerLineup()).next(match.teamBBowlingLineup);
    this.getOrCreateSubject(this.inningsChangeSubjects, gameId, 1 as 1 | 2).next(match.status.currentInnings);
  }

  public reloadMatchData(gameId: string) {
    const match = this.getOrCreateMatch(gameId);
    const wagonWheelState = this.wagonWheelState.get(gameId);
    
    this.loadFixture(gameId).pipe(
      concatMap(x => this.loadGameTeamIDs(gameId)),
      concatMap(x => this.loadLineup(gameId, 'Batting', 1)),
      concatMap(x => this.loadLineup(gameId, 'Batting', 2)),
      concatMap(x => this.loadLineup(gameId, 'Bowling', 1)),
      concatMap(x => this.loadLineup(gameId, 'Bowling', 2)),
      concatMap(x => this.loadRecentOvers(gameId, 1)),
      concatMap(x => this.loadRecentOvers(gameId, 2)),
      concatMap(x => this.loadFallOfWickets(gameId, 1)),
      concatMap(x => this.loadFallOfWickets(gameId, 2)),
      concatMap(x => this.loadBattingScorecard(gameId, match.innings1Detail)),
      concatMap(x => this.loadBattingScorecard(gameId, match.innings2Detail)),
      concatMap(x => this.loadCurrentBatters(gameId, 1)),
      concatMap(x => this.loadCurrentBatters(gameId, 2)),
      concatMap(x => this.loadCurrentBowlers(gameId, 1)),
      concatMap(x => this.loadCurrentBowlers(gameId, 2)),
      concatMap(x => this.loadBowlingScorecard(gameId, match.innings1Detail)),
      concatMap(x => this.loadBowlingScorecard(gameId, match.innings2Detail)),
      concatMap(x => this.loadRunComparison(gameId)),
      concatMap(x => this.loadWagonWheel(gameId, wagonWheelState?.teamId || '', wagonWheelState?.playerId || 0, wagonWheelState?.type || 'Batting'))
    ).subscribe()
  }

  private loadFixture(gameId: string): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    return this.webSportsApi.getFixtures(gameId)
      .pipe(
        map(result => {
          if (result.fixtures.length > 0) {
            let updatedMatch = result.fixtures[0];
            match.loadFixture(updatedMatch);
            this.getOrCreateSubject(this.fixtureSubjects, gameId, new Fixture()).next(match.fixture);
            this.getOrCreateSubject(this.statusSubjects, gameId, new Status()).next(match.status);

            match.teamAScore.load(updatedMatch);
            this.getOrCreateSubject(this.teamAScoreSubjects, gameId, new TeamScore()).next(match.teamAScore);

            match.teamBScore.load(updatedMatch);
            this.getOrCreateSubject(this.teamBScoreSubjects, gameId, new TeamScore()).next(match.teamBScore);
          }
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = '';

    if (error.error instanceof ProgressEvent && error.status === 0) {
      message = 'Network error or timeout occurred while loading data from WebSports.';
    } else if (error.status === 400) {
      message = 'Error 404: WebSports API could not find the requested resource';
    } else {
      message = (`Error ${error.status}: ${error.statusText || 'Unknown error'}: ${error.message}`);
    }
    this.toasterMessage.showMessage(message);
    return throwError(() => new Error(message));
  }

  private loadGameTeamIDs(gameId: string): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    return this.webSportsApi.getFixtureBySport(gameId)
      .pipe(
        map(matches => {
          if (matches.fixtures.length > 0) {
            match.loadTeamIds(matches.fixtures[0]);
            this.getOrCreateSubject(this.fixtureSubjects, gameId, new Fixture()).next(match.fixture);
          }
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
  }

  private loadLineup(gameId: string, type: 'Batting' | 'Bowling', teamNumber: 1 | 2): Observable<any> {
    const match = this.getOrCreateMatch(gameId);

    if (type == 'Batting' && teamNumber == 1) {
      return this.webSportsApi.getBattingLineup(gameId, match.fixture.teamAId).pipe(
        map(lineup => {
          match.loadLineup('Batting', 1, lineup);
          this.getOrCreateSubject(this.teamABattingLineupSubjects, gameId, new PlayerLineup()).next(match.teamABattingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
    if (type == 'Batting' && teamNumber == 2) {
      return this.webSportsApi.getBattingLineup(gameId, match.fixture.teamBId).pipe(
        map(lineup => {
          match.loadLineup('Batting', 2, lineup);
          this.getOrCreateSubject(this.teamBBattingLineupSubjects, gameId, new PlayerLineup()).next(match.teamBBattingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
    if (type == 'Bowling' && teamNumber == 1) {
      return this.webSportsApi.getBowlingLineup(gameId, match.fixture.teamAId).pipe(
        map(lineup => {
          match.loadLineup('Bowling', 1, lineup);
          this.getOrCreateSubject(this.teamABowlingLineupSubjects, gameId, new PlayerLineup()).next(match.teamABowlingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
    if (type == 'Bowling' && teamNumber == 2) {
      return this.webSportsApi.getBowlingLineup(gameId, match.fixture.teamBId).pipe(
        map(lineup => {
          match.loadLineup('Bowling', 2, lineup)
          this.getOrCreateSubject(this.teamBBowlingLineupSubjects, gameId, new PlayerLineup()).next(match.teamBBowlingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
    return of('');
  }

  private loadRecentOvers(gameId: string, innings: number): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    if (innings == 1) {
      return this.webSportsApi.getBallCountdown(gameId, match.fixture.teamAId, 1).pipe(
        map(ballCountdown => {
          match.innings1Detail.recentOvers.loadRecentOvers(ballCountdown);
          this.getOrCreateSubject(this.innings1RecentOversSubjects, gameId, new RecentBalls()).next(match.innings1Detail.recentOvers)
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getBallCountdown(gameId, match.fixture.teamBId, 2).pipe(
        map(ballCountdown => {
          match.innings2Detail.recentOvers.loadRecentOvers(ballCountdown)
          this.getOrCreateSubject(this.innings2RecentOversSubjects, gameId, new RecentBalls()).next(match.innings2Detail.recentOvers)
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadCurrentBatters(gameId: string, innings: number): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    if (innings == 1) {
      return this.webSportsApi.getBatsmen(gameId, match.fixture.teamAId).pipe(
        map(batsmen => {
          match.innings1Detail.currentBatters.loadCurrentBatters(batsmen);
          match.innings1Detail.battingScorecard.addOnStrike(batsmen);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getBatsmen(gameId, match.fixture.teamBId).pipe(
        map(batsmen => {
          match.innings2Detail.currentBatters.loadCurrentBatters(batsmen);
          match.innings2Detail.battingScorecard.addOnStrike(batsmen);

          if (match.innings2Detail.currentBatters.batters.length > 0) {
            if (match.status.currentInnings == 1) {
              match.status.currentInnings = 2;
              this.getOrCreateSubject(this.inningsChangeSubjects, gameId, 1 as 1 | 2).next(match.status.currentInnings);
            }
          }
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadFallOfWickets(gameId: string, innings: number): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    if (innings == 1) {
      return this.webSportsApi.getFallOfWickets(gameId, match.fixture.teamAId).pipe(
        map(fallOfWickets => {
          match.innings1Detail.fallOfWickets.loadFallOfWickets(fallOfWickets);
          this.getOrCreateSubject(this.innings1FallOfWicketsSubjects, gameId, new FallOfWickets()).next(match.innings1Detail.fallOfWickets);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getFallOfWickets(gameId, match.fixture.teamBId).pipe(
        map(fallOfWickets => {
          match.innings2Detail.fallOfWickets.loadFallOfWickets(fallOfWickets);
          this.getOrCreateSubject(this.innings2FallOfWicketsSubjects, gameId, new FallOfWickets()).next(match.innings2Detail.fallOfWickets);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadBattingScorecard(gameId: string, innings: InningsDetail): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    if (innings.number == 1) {
      return this.webSportsApi.getBattingScorecard(gameId, match.fixture.teamAId).pipe(
        map(scorecard => {
          innings.battingScorecard.loadBattingScorcard(scorecard);
          this.getOrCreateSubject(this.teamAbattingScorecardSubjects, gameId, new BattingScorecard()).next(innings.battingScorecard);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getBattingScorecard(gameId, match.fixture.teamBId).pipe(
        map(scorecard => {
          innings.battingScorecard.loadBattingScorcard(scorecard);
          this.getOrCreateSubject(this.teamBbattingScorecardSubjects, gameId, new BattingScorecard()).next(innings.battingScorecard);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadBowlingScorecard(gameId: string, innings: InningsDetail): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    if (innings.number == 1) {
      return this.webSportsApi.getBowlingScorecard(gameId, match.fixture.teamBId).pipe(
        map(scorecard => {
          innings.bowlingScorecard.loadBowlingScorcard(scorecard);
          match.innings1Detail.bowlingScorecard.addCurrentBowlers(match.innings1Detail.currentBowlers);
          this.getOrCreateSubject(this.teamBBowlingScorecardSubjects, gameId, new BowlingScorecard()).next(innings.bowlingScorecard);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getBowlingScorecard(gameId, match.fixture.teamAId).pipe(
        map(scorecard => {
          innings.bowlingScorecard.loadBowlingScorcard(scorecard);
          match.innings2Detail.bowlingScorecard.addCurrentBowlers(match.innings2Detail.currentBowlers);
          this.getOrCreateSubject(this.teamABowlingScorecardSubjects, gameId, new BowlingScorecard()).next(innings.bowlingScorecard);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadCurrentBowlers(gameId: string, innings: number): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    return this.webSportsApi.getCurrentBowlers(gameId).pipe(
      map(bowling => {
        if (innings == 1) {
          match.innings1Detail.currentBowlers.loadCurrentBowlers(bowling);
        }
        else {
          match.innings2Detail.currentBowlers.loadCurrentBowlers(bowling);
        }
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    )
  }

  private loadRunComparison(gameId: string): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    return this.webSportsApi.getRunComparison(gameId).pipe(
      map(inputRunComparison => {
        let runComparisonFactory = new RunComparisonFactory()
        match.runComparison = runComparisonFactory.loadRunComparison(inputRunComparison)
        this.getOrCreateSubject(this.runComparisonSubjects, gameId, new RunComparison()).next(match.runComparison);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    )
  }

  public setWagonWheelPlayer(gameId: string, teamId: string, playerId: number, type: 'Batting' | 'Bowling') {
    this.wagonWheelState.set(gameId, { teamId, playerId, type });
    this.loadWagonWheel(gameId, teamId, playerId, type).subscribe();
  }

  private loadWagonWheel(gameId: string, teamId: string, playerId: number, type: 'Batting' | 'Bowling'): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    if (playerId > 0) {
      return this.webSportsApi.getWagonWheel(gameId, teamId, playerId.toString(), type).pipe(
        map(inputWagonWheel => {
          match.wagonWheel.loadWagonWheel(teamId, playerId, type, inputWagonWheel);
          this.getOrCreateSubject(this.wagonWheelSubjects, gameId, new WagonWheel()).next(match.wagonWheel);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return of(true);
    }
  }
}
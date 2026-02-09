import { Injectable } from '@angular/core';
import { Fixture, Match, Status } from '../models/match';
import { BattingInningsDetail, PlayerLineup } from '../models/batting-innings-detail';
import { Partnership } from '../models/partnership';
import { WebSportsAPIService } from './web-sports-api.service';
import { BehaviorSubject, catchError, concatMap, map, Observable, of, throwError } from 'rxjs';
import { TeamScore } from '../models/team-score';
import { RunComparison, RunComparisonFactory } from '../models/run-comparison';
import { BattingScorecard, BowlingScorecard } from '../models/scorecard';
import { RecentBalls } from '../models/recent-balls';
import { FallOfWickets } from '../models/fall-of-wickets';
import { WagonWheel } from '../models/wagon-wheel';
import { BallByBallCommentary } from '../models/ball-commentary';
import { HttpErrorResponse } from '@angular/common/http';
import { ToasterMessageService } from './toaster-message.service';
import { isApiErrorResponse } from '../models/api-response';

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
  // Innings-aware team score subjects using compound keys (gameId-i{inningsNumber}-t{teamNumber})
  private teamScoreSubjects = new Map<string, BehaviorSubject<TeamScore>>();
  // Consolidated subjects using compound keys (gameId-i{inningsNumber}-t{teamNumber})
  private battingScorecardSubjects = new Map<string, BehaviorSubject<BattingScorecard>>();
  private bowlingScorecardSubjects = new Map<string, BehaviorSubject<BowlingScorecard>>();
  private recentOversSubjects = new Map<string, BehaviorSubject<RecentBalls>>();
  private fallOfWicketsSubjects = new Map<string, BehaviorSubject<FallOfWickets>>();
  private ballByBallCommentarySubjects = new Map<string, BehaviorSubject<BallByBallCommentary>>();
  private partnershipSubjects = new Map<string, BehaviorSubject<Partnership[]>>();
  private battingLineupSubjects = new Map<string, BehaviorSubject<PlayerLineup>>();
  private bowlingLineupSubjects = new Map<string, BehaviorSubject<PlayerLineup>>();
  private runComparisonSubjects = new Map<string, BehaviorSubject<RunComparison>>();
  private wagonWheelSubjects = new Map<string, BehaviorSubject<WagonWheel>>();
  private battingInningsChangeSubjects = new Map<string, BehaviorSubject<1 | 2 | 3 | 4>>();

  constructor(public webSportsApi: WebSportsAPIService, private toasterMessage: ToasterMessageService) { }

  private getMatchInningsFromBattingInningsNumber(battingInningsNumber: 1 | 2 | 3 | 4): 1 | 2 {
    return battingInningsNumber <= 2 ? 1 : 2;
  }

  private getTeamNumberFromBattingInningsNumber(battingInningsNumber: 1 | 2 | 3 | 4): 1 | 2 {
    return battingInningsNumber % 2 === 1 ? 1 : 2;
  }

  private getTeamIdFromBattingInningsNumber(match: Match, battingInningsNumber: 1 | 2 | 3 | 4): string { 
    const teamNumber = this.getTeamNumberFromBattingInningsNumber(battingInningsNumber);
    return teamNumber === 1 ? match.fixture.teamAId : match.fixture.teamBId;
  }

  /**
   * Helper to create compound key for batting innings specific subjects
   */
  private getGameBattingInningsKey(gameId: string, battingInningsNumber: 1 | 2 | 3 | 4): string {
    return `${gameId}-i${battingInningsNumber}`;
  }

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

  /**
   * Get innings-specific team score updates
   */
  getTeamScoreUpdates(gameId: string, battingInningsNumber: 1 | 2 | 3 |4): Observable<TeamScore> {
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    return this.getOrCreateSubject(this.teamScoreSubjects, key, new TeamScore()).asObservable();
  }

  getBattingScorecardUpdates(gameId: string, battingInningsNumber: 1 | 2 | 3 |4): Observable<BattingScorecard> {
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    return this.getOrCreateSubject(this.battingScorecardSubjects, key, new BattingScorecard()).asObservable();
  }

  getBowlingScorecardUpdates(gameId: string, battingInningsNumber: 1 | 2 | 3 |4): Observable<BowlingScorecard> {
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    return this.getOrCreateSubject(this.bowlingScorecardSubjects, key, new BowlingScorecard()).asObservable();
  }

  getRecentOversUpdates(gameId: string, battingInningsNumber: 1 | 2 | 3 |4): Observable<RecentBalls> {
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    return this.getOrCreateSubject(this.recentOversSubjects, key, new RecentBalls()).asObservable();
  }

  getFallOfWicketsUpdates(gameId: string,battingInningsNumber: 1 | 2 | 3 |4): Observable<FallOfWickets> {
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    return this.getOrCreateSubject(this.fallOfWicketsSubjects, key, new FallOfWickets()).asObservable();
  }

  getBallByBallCommentaryUpdates(gameId: string, battingInningsNumber: 1 | 2 | 3 |4): Observable<BallByBallCommentary> {
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    return this.getOrCreateSubject(this.ballByBallCommentarySubjects, key, new BallByBallCommentary()).asObservable();
  }

  getPartnershipUpdates(gameId: string,battingInningsNumber: 1 | 2 | 3 |4): Observable<Partnership[]> {
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    return this.getOrCreateSubject(this.partnershipSubjects, key, []).asObservable();
  }

  getBattingLineupUpdates(gameId: string,battingInningsNumber: 1 | 2 | 3 |4): Observable<PlayerLineup> {
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    return this.getOrCreateSubject(this.battingLineupSubjects, key, new PlayerLineup()).asObservable();
  }

  getBowlingLineupUpdates(gameId: string, battingInningsNumber: 1 | 2 | 3 |4): Observable<PlayerLineup> {
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    return this.getOrCreateSubject(this.bowlingLineupSubjects, key, new PlayerLineup()).asObservable();
  }

  getRunComparisonUpdates(gameId: string): Observable<RunComparison> {
    return this.getOrCreateSubject(this.runComparisonSubjects, gameId, new RunComparison()).asObservable();
  }

  getWagonWheelUpdates(gameId: string): Observable<WagonWheel> {
    return this.getOrCreateSubject(this.wagonWheelSubjects, gameId, new WagonWheel()).asObservable();
  }

  getBattingInningsChangeUpdates(gameId: string): Observable<1 | 2 | 3 | 4> {
    return this.getOrCreateSubject(this.battingInningsChangeSubjects, gameId, 1 as 1 | 2 | 3 | 4).asObservable();
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
    } else {
      // Check if cached match has old structure version
      const match = this.matches.get(gameId)!;
      if (!Match.STRUCTURE_VERSION || Match.STRUCTURE_VERSION < 2) {
        // Invalidate old cached data and create new match
        this.matches.set(gameId, new Match());
      }
    }
    return this.matches.get(gameId)!;
  }

  /**
   * Helper to get team key ('A' or 'B') from team number
   */
  private getTeamKey(teamNumber: 1 | 2): 'A' | 'B' {
    return teamNumber === 1 ? 'A' : 'B';
  }

  private getBattingInningsNumber(inningsNumber: 1 | 2, teamNumber: 1 | 2): 1 | 2 | 3 | 4 {
    return (inningsNumber - 1) * 2 + teamNumber as 1 | 2 | 3 | 4;
  }

  /**
   * Helper to get team ID from match fixture
   */
  private getTeamId(match: Match, teamNumber: 1 | 2): string {
    return teamNumber === 1 ? match.fixture.teamAId : match.fixture.teamBId;
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

    // Emit match-level data
    this.getOrCreateSubject(this.fixtureSubjects, gameId, new Fixture()).next(match.fixture);
    this.getOrCreateSubject(this.statusSubjects, gameId, new Status()).next(match.status);
    this.getOrCreateSubject(this.teamAScoreSubjects, gameId, new TeamScore()).next(match.teamAScore);
    this.getOrCreateSubject(this.teamBScoreSubjects, gameId, new TeamScore()).next(match.teamBScore);
    this.getOrCreateSubject(this.runComparisonSubjects, gameId, new RunComparison()).next(match.runComparison);
    this.getOrCreateSubject(this.wagonWheelSubjects, gameId, new WagonWheel()).next(match.wagonWheel);
    this.getOrCreateSubject(this.battingInningsChangeSubjects, gameId, 1 as 1 | 2 | 3 | 4).next(match.status.currentBattingInnings);

    // Emit batting innings specific data using loops
    for (let battingInningsNumber = 1; battingInningsNumber <= 4; battingInningsNumber++) {
        const battingInnings = match.battingInnings[battingInningsNumber - 1];
        const key = this.getGameBattingInningsKey(gameId, battingInningsNumber as 1 | 2 | 3 | 4);

        this.getOrCreateSubject(this.battingScorecardSubjects, key, new BattingScorecard()).next(battingInnings.battingScorecard);
        this.getOrCreateSubject(this.bowlingScorecardSubjects, key, new BowlingScorecard()).next(battingInnings.bowlingScorecard);
        this.getOrCreateSubject(this.recentOversSubjects, key, new RecentBalls()).next(battingInnings.recentOvers);
        this.getOrCreateSubject(this.fallOfWicketsSubjects, key, new FallOfWickets()).next(battingInnings.fallOfWickets);
        this.getOrCreateSubject(this.ballByBallCommentarySubjects, key, new BallByBallCommentary()).next(battingInnings.ballByBallCommentary);
        this.getOrCreateSubject(this.battingLineupSubjects, key, new PlayerLineup()).next(battingInnings.battingLineup);
        this.getOrCreateSubject(this.bowlingLineupSubjects, key, new PlayerLineup()).next(battingInnings.bowlingLineup);
    }
  }

  /**
   * Check if a match is complete (finished) based on its result status
   * Returns false if match is still in progress, upcoming, or status not yet loaded
   * Returns true if match has a definitive result (won, drawn, no result)
   */
  public isMatchComplete(gameId: string): boolean {
    const match = this.matches.get(gameId);

    // If match not loaded or no status, treat as incomplete (will refresh)
    if (!match || !match.status.result) {
      return false;
    }

    const result = match.status.result.toLowerCase();

    // Match is complete if result contains these keywords
    return result.includes('won') ||
      result.includes('drawn') ||
      result.includes('no result') ||
      result.includes('abandoned');
  }

  public reloadMatchData(gameId: string) {
    const match = this.getOrCreateMatch(gameId);

    this.loadFixture(gameId).pipe(
      concatMap(x => this.loadGameTeamIDs(gameId)),
      // Load innings 1 lineups
      concatMap(x => this.loadLineup(gameId, 'Batting', 1)),
      concatMap(x => this.loadLineup(gameId, 'Batting', 2)),
      concatMap(x => this.loadLineup(gameId, 'Bowling', 1)),
      concatMap(x => this.loadLineup(gameId, 'Bowling', 2)),
      // Load innings 1 data
      concatMap(x => this.loadRecentOvers(gameId, 1)),
      concatMap(x => this.loadRecentOvers(gameId, 2)),
      concatMap(x => this.loadFallOfWickets(gameId,1)),
      concatMap(x => this.loadFallOfWickets(gameId, 2)),
      concatMap(x => this.loadBallByBallCommentary(gameId, 1)),
      concatMap(x => this.loadBallByBallCommentary(gameId, 2)),
      concatMap(x => this.loadBattingScorecard(gameId, 1)),
      concatMap(x => this.loadBattingScorecard(gameId, 2)),
      concatMap(x => this.loadCurrentBatters(gameId, 1)),
      concatMap(x => this.loadCurrentBatters(gameId, 2)),
      concatMap(x => this.loadCurrentBowlers(gameId, 1)),
      concatMap(x => this.loadCurrentBowlers(gameId, 2)),
      concatMap(x => this.loadBowlingScorecard(gameId, 1)),
      concatMap(x => this.loadBowlingScorecard(gameId, 2)),
      // Load innings 2 lineups (may return empty if not started)
      concatMap(x => this.loadLineup(gameId, 'Batting', 3)),
      concatMap(x => this.loadLineup(gameId, 'Batting', 4)),
      concatMap(x => this.loadLineup(gameId, 'Bowling', 3)),
      concatMap(x => this.loadLineup(gameId, 'Bowling', 4)),
      // Load innings 2 data (may return empty if not started)
      concatMap(x => this.loadRecentOvers(gameId, 3)),
      concatMap(x => this.loadRecentOvers(gameId, 4)),
      concatMap(x => this.loadFallOfWickets(gameId,3)),
      concatMap(x => this.loadFallOfWickets(gameId, 4)),
      concatMap(x => this.loadBallByBallCommentary(gameId, 3)),
      concatMap(x => this.loadBallByBallCommentary(gameId,4)),
      concatMap(x => this.loadBattingScorecard(gameId, 3)),
      concatMap(x => this.loadBattingScorecard(gameId, 4)),
      concatMap(x => this.loadCurrentBatters(gameId, 3)),
      concatMap(x => this.loadCurrentBatters(gameId, 4)),
      concatMap(x => this.loadCurrentBowlers(gameId, 3)),
      concatMap(x => this.loadCurrentBowlers(gameId, 4)),
      concatMap(x => this.loadBowlingScorecard(gameId, 3)),
      concatMap(x => this.loadBowlingScorecard(gameId, 4)),
      // Load match-level data
      concatMap(x => this.loadRunComparison(gameId)),
      // Load team scores for both innings
      concatMap(x => this.loadTeamScores(gameId, 1)),
      concatMap(x => this.loadTeamScores(gameId, 2))
    ).subscribe()
  }

  private loadFixture(gameId: string): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    return this.webSportsApi.getFixtures(gameId, 1)
      .pipe(
        map(result => {
          if (result.fixtures.length > 0) {
            let updatedMatch = result.fixtures[0];
            match.loadFromAPI(updatedMatch);
            this.getOrCreateSubject(this.fixtureSubjects, gameId, new Fixture()).next(match.fixture);
            this.getOrCreateSubject(this.statusSubjects, gameId, new Status()).next(match.status);

            match.teamAScore.loadFromAPI(updatedMatch);
            this.getOrCreateSubject(this.teamAScoreSubjects, gameId, new TeamScore()).next(match.teamAScore.clone());

            match.teamBScore.loadFromAPI(updatedMatch);
            this.getOrCreateSubject(this.teamBScoreSubjects, gameId, new TeamScore()).next(match.teamBScore.clone());
          }
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
  }

  /**
   * Load team scores for a specific innings
   */
  private loadTeamScores(gameId: string, inningsNumber: 1 | 2): Observable<any> {
    return this.webSportsApi.getFixtures(gameId, inningsNumber)
      .pipe(
        map(result => {
          if (result.fixtures.length > 0) {
            let fixtureData = result.fixtures[0];

            
            // Load Team A score for this innings
            const teamAScore = new TeamScore();
            teamAScore.teamNumber = 1;
            teamAScore.loadFromAPI(fixtureData);
            let battingInningsNumberA = this.getBattingInningsNumber(inningsNumber, 1);
            const keyA = this.getGameBattingInningsKey(gameId, battingInningsNumberA);
            this.getOrCreateSubject(this.teamScoreSubjects, keyA, new TeamScore()).next(teamAScore);

            // Load Team B score for this innings
            const teamBScore = new TeamScore();
            teamBScore.teamNumber = 2;
            teamBScore.loadFromAPI(fixtureData);
            let battingInningsNumberB = this.getBattingInningsNumber(inningsNumber, 2);
            const keyB = this.getGameBattingInningsKey(gameId, battingInningsNumberB);
            this.getOrCreateSubject(this.teamScoreSubjects, keyB, new TeamScore()).next(teamBScore);
          }
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = '';

    if (error.error instanceof ProgressEvent && error.status === 0) {
      message = 'Network error or timeout occurred while loading data from WebSports.';
    } else if (error.status === 400) {
      // Check if this is an API error response (intercepted from 200 OK)
      if (isApiErrorResponse(error.error)) {
        message = `WebSports Error: ${error.error.Message || error.error.err || 'Unknown error occurred'}`;
      } else {
        message = 'WebSports API could not find the requested resource';
      }
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
            match.loadTeamIdsFromAPI(matches.fixtures[0]);
            this.getOrCreateSubject(this.fixtureSubjects, gameId, new Fixture()).next(match.fixture);
          }
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
  }

  private loadLineup(gameId: string, type: 'Batting' | 'Bowling', battingInningsNumber: 1 | 2 | 3 | 4 ): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    const battingInnings = match.battingInnings[battingInningsNumber - 1];
    const teamId = this.getTeamIdFromBattingInningsNumber(match, battingInningsNumber);
    const matchInningsNumber = this.getMatchInningsFromBattingInningsNumber(battingInningsNumber);

    if (type == 'Batting') {
      return this.webSportsApi.getBattingLineup(gameId, teamId, matchInningsNumber).pipe(
        map(lineup => {
          match.loadLineupFromAPI('Batting', battingInningsNumber, lineup);
          this.getOrCreateSubject(this.battingLineupSubjects, key, new PlayerLineup()).next(battingInnings.battingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getBowlingLineup(gameId, teamId, matchInningsNumber).pipe(
        map(lineup => {
          match.loadLineupFromAPI('Bowling', battingInningsNumber, lineup);
          this.getOrCreateSubject(this.bowlingLineupSubjects, key, new PlayerLineup()).next(battingInnings.bowlingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadRecentOvers(gameId: string, battingInningsNumber: 1 | 2 | 3 | 4 ): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const battingInnings = match.battingInnings[battingInningsNumber - 1];
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    const teamId = this.getTeamIdFromBattingInningsNumber(match, battingInningsNumber);

    return this.webSportsApi.getBallCountdown(gameId, teamId, battingInningsNumber).pipe(
      map(ballCountdown => {
        battingInnings.recentOvers.loadFromAPI(ballCountdown);
        this.getOrCreateSubject(this.recentOversSubjects, key, new RecentBalls()).next(battingInnings.recentOvers);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadCurrentBatters(gameId: string, battingInningsNumber: 1 | 2 | 3 | 4): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const battingInnings = match.battingInnings[battingInningsNumber - 1];
    const teamId = this.getTeamIdFromBattingInningsNumber(match, battingInningsNumber);
    const matchInningsNumber = this.getMatchInningsFromBattingInningsNumber(battingInningsNumber);

    return this.webSportsApi.getBatsmen(gameId, teamId, matchInningsNumber).pipe(
      map(batsmen => {
        battingInnings.currentBatters.loadFromAPI(batsmen);
        battingInnings.battingScorecard.addOnStrike(batsmen);

        // Check if innings has changed
        if ((battingInningsNumber > match.status.currentBattingInnings) && batsmen.batsmen.length > 0) {
          this.matches.get(gameId)!.status.currentBattingInnings = battingInningsNumber;
          this.getOrCreateSubject(this.battingInningsChangeSubjects, gameId, battingInningsNumber).next(battingInningsNumber);
        }

      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadFallOfWickets(gameId: string, battingInningsNumber: 1 | 2 | 3 | 4 ): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const battingInnings = match.battingInnings[battingInningsNumber - 1];
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    const teamId = this.getTeamIdFromBattingInningsNumber(match, battingInningsNumber);
    const matchInningsNumber = this.getMatchInningsFromBattingInningsNumber(battingInningsNumber);

    return this.webSportsApi.getFallOfWickets(gameId, teamId, matchInningsNumber).pipe(
      map(fallOfWickets => {
        battingInnings.fallOfWickets.loadFromAPI(fallOfWickets);
        this.getOrCreateSubject(this.fallOfWicketsSubjects, key, new FallOfWickets()).next(battingInnings.fallOfWickets);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadBallByBallCommentary(gameId: string, battingInningsNumber: 1 | 2 | 3 | 4 ): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const battingInnings = match.battingInnings[battingInningsNumber - 1];
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    const teamId = this.getTeamIdFromBattingInningsNumber(match, battingInningsNumber);
    const matchInningsNumber = this.getMatchInningsFromBattingInningsNumber(battingInningsNumber);

    return this.webSportsApi.getCommentary(gameId, teamId, matchInningsNumber).pipe(
      map(commentary => {
        battingInnings.ballByBallCommentary.loadFromAPI(commentary);
        this.getOrCreateSubject(this.ballByBallCommentarySubjects, key, new BallByBallCommentary()).next(battingInnings.ballByBallCommentary.clone());

        // Calculate and emit partnerships
        battingInnings.calculatePartnerships();
        this.getOrCreateSubject(this.partnershipSubjects, key, []).next(Partnership.cloneArray(battingInnings.partnerships));
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadBattingScorecard(gameId: string, battingInningsNumber: 1 | 2 | 3 | 4): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const battingInnings = match.battingInnings[battingInningsNumber - 1];
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    const teamId = this.getTeamIdFromBattingInningsNumber(match, battingInningsNumber);
    const matchInningsNumber = this.getMatchInningsFromBattingInningsNumber(battingInningsNumber);

    return this.webSportsApi.getBattingScorecard(gameId, teamId, matchInningsNumber).pipe(
      map(scorecard => {
        battingInnings.battingScorecard.loadFromAPI(scorecard);
        this.getOrCreateSubject(this.battingScorecardSubjects, key, new BattingScorecard()).next(battingInnings.battingScorecard.clone());
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadBowlingScorecard(gameId: string,  battingInningsNumber: 1 | 2 | 3 | 4): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const battingInnings = match.battingInnings[battingInningsNumber - 1];
    const key = this.getGameBattingInningsKey(gameId, battingInningsNumber);
    const teamId = this.getTeamIdFromBattingInningsNumber(match, battingInningsNumber);
    const matchInningsNumber = this.getMatchInningsFromBattingInningsNumber(battingInningsNumber);

    return this.webSportsApi.getBowlingScorecard(gameId, teamId, matchInningsNumber).pipe(
      map(scorecard => {
        battingInnings.bowlingScorecard.loadFromAPI(scorecard);
        battingInnings.bowlingScorecard.addCurrentBowlers(battingInnings.currentBowlers);
        this.getOrCreateSubject(this.bowlingScorecardSubjects, key, new BowlingScorecard()).next(battingInnings.bowlingScorecard);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadCurrentBowlers(gameId: string,  battingInningsNumber: 1 | 2 | 3 | 4): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const battingInnings = match.battingInnings[battingInningsNumber - 1];

    return this.webSportsApi.getCurrentBowlers(gameId, battingInningsNumber).pipe(
      map(bowling => {
        battingInnings.currentBowlers.loadFromAPI(bowling);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadRunComparison(gameId: string): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    return this.webSportsApi.getRunComparison(gameId).pipe(
      map(inputRunComparison => {
        let runComparisonFactory = new RunComparisonFactory()
        match.runComparison = runComparisonFactory.loadFromAPI(inputRunComparison)
        this.getOrCreateSubject(this.runComparisonSubjects, gameId, new RunComparison()).next(match.runComparison);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    )
  }

  loadWagonWheel(gameId: string, playerId: string, battingInningsNumber: 1 | 2 | 3 | 4, type: 'batting' | 'bowling' = 'batting'): void {
    const match = this.getOrCreateMatch(gameId);
    const playerIdNum = parseInt(playerId);

    const matchInnings = this.getMatchInningsFromBattingInningsNumber(battingInningsNumber);
    const teamNumber = this.getTeamNumberFromBattingInningsNumber(battingInningsNumber);

    if (playerIdNum > 0) {
      // Wagon wheel API uses match innings (1 or 2), NOT batting innings chronological order
      const teamId = this.getTeamId(match, teamNumber);
      const teamIdString = String(teamId);

      this.webSportsApi.getWagonWheel(gameId, matchInnings, teamIdString, playerId, type).pipe(
        map(inputWagonWheel => {
          const wagonWheelType: 'Batting' | 'Bowling' = type === 'batting' ? 'Batting' : 'Bowling';
          match.wagonWheel.loadFromAPI(teamIdString, playerIdNum, wagonWheelType, inputWagonWheel);
          this.getOrCreateSubject(this.wagonWheelSubjects, gameId, new WagonWheel()).next(match.wagonWheel);
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      ).subscribe();
    }
  }
}
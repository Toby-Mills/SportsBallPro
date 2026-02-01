import { Injectable } from '@angular/core';
import { Fixture, Match, PlayerLineup, Status } from '../models/match';
import { WebSportsAPIService } from './web-sports-api.service';
import { BehaviorSubject, catchError, concatMap, map, Observable, of, throwError } from 'rxjs';
import { TeamScore } from '../models/team-score';
import { BattingInningsDetail } from '../models/innings-detail';
import { RunComparison, RunComparisonFactory } from '../models/run-comparison';
import { BattingScorecard, BowlingScorecard } from '../models/scorecard';
import { RecentBalls } from '../models/recent-balls';
import { FallOfWickets } from '../models/fall-of-wickets';
import { WagonWheel } from '../models/wagon-wheel';
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
  private battingLineupSubjects = new Map<string, BehaviorSubject<PlayerLineup>>();
  private bowlingLineupSubjects = new Map<string, BehaviorSubject<PlayerLineup>>();
  private runComparisonSubjects = new Map<string, BehaviorSubject<RunComparison>>();
  private wagonWheelSubjects = new Map<string, BehaviorSubject<WagonWheel>>();
  private inningsChangeSubjects = new Map<string, BehaviorSubject<1 | 2>>();

  constructor(public webSportsApi: WebSportsAPIService, private toasterMessage: ToasterMessageService) { }

  /**
   * Helper to create compound key for batting innings specific subjects
   */
  private getBattingInningsKey(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): string {
    return `${gameId}-i${inningsNumber}-t${teamNumber}`;
  }

  /**
   * Helper to create compound key for team score subjects (innings-aware)
   */
  private getTeamScoreKey(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): string {
    return `${gameId}-i${inningsNumber}-t${teamNumber}`;
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
  getTeamScoreUpdates(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<TeamScore> {
    const key = this.getTeamScoreKey(gameId, inningsNumber, teamNumber);
    return this.getOrCreateSubject(this.teamScoreSubjects, key, new TeamScore()).asObservable();
  }

  getBattingScorecardUpdates(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<BattingScorecard> {
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    return this.getOrCreateSubject(this.battingScorecardSubjects, key, new BattingScorecard()).asObservable();
  }

  getBowlingScorecardUpdates(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<BowlingScorecard> {
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    return this.getOrCreateSubject(this.bowlingScorecardSubjects, key, new BowlingScorecard()).asObservable();
  }

  getRecentOversUpdates(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<RecentBalls> {
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    return this.getOrCreateSubject(this.recentOversSubjects, key, new RecentBalls()).asObservable();
  }

  getFallOfWicketsUpdates(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<FallOfWickets> {
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    return this.getOrCreateSubject(this.fallOfWicketsSubjects, key, new FallOfWickets()).asObservable();
  }

  getBattingLineupUpdates(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<PlayerLineup> {
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    return this.getOrCreateSubject(this.battingLineupSubjects, key, new PlayerLineup()).asObservable();
  }

  getBowlingLineupUpdates(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<PlayerLineup> {
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    return this.getOrCreateSubject(this.bowlingLineupSubjects, key, new PlayerLineup()).asObservable();
  }

  getRunComparisonUpdates(gameId: string): Observable<RunComparison> {
    return this.getOrCreateSubject(this.runComparisonSubjects, gameId, new RunComparison()).asObservable();
  }

  getWagonWheelUpdates(gameId: string): Observable<WagonWheel> {
    return this.getOrCreateSubject(this.wagonWheelSubjects, gameId, new WagonWheel()).asObservable();
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

  /**
   * Helper to get BattingInningsDetail from match
   */
  private getBattingInnings(match: Match, inningsNumber: 1 | 2, teamNumber: 1 | 2): BattingInningsDetail {
    return match.innings[inningsNumber - 1].battingInnings[teamNumber - 1];
  }

  /**
   * Helper to get team ID from match fixture
   */
  private getTeamId(match: Match, teamNumber: 1 | 2): string {
    return teamNumber === 1 ? match.fixture.teamAId : match.fixture.teamBId;
  }

  /**
   * Helper to determine which API batting innings to use for a given team's batting period
   * The API uses batting innings 1-4 to indicate batting order:
   * - Batting Innings 1 = First team to bat, first time (Match Innings 1)
   * - Batting Innings 2 = Second team to bat, first time (Match Innings 1)
   * - Batting Innings 3 = First team to bat, second time (Match Innings 2)
   * - Batting Innings 4 = Second team to bat, second time (Match Innings 2)
   */
  private getApiBattingInnings(match: Match, inningsNumber: 1 | 2, teamNumber: 1 | 2): 1 | 2 | 3 | 4 {
    // Determine which team batted first based on toss decision
    let teamBattingFirst: 1 | 2 = 1; // Default to team 1
    
    if (match.status.tossWonByTeam && match.status.decidedTo) {
      const tossWinner = match.status.tossWonByTeam;
      const decidedTo = match.status.decidedTo.toLowerCase();
      
      // Determine which team is team 1 and team 2
      const isTeam1TossWinner = tossWinner === match.fixture.teamAName;
      
      if (decidedTo.includes('bat')) {
        // Toss winner chose to bat first
        teamBattingFirst = isTeam1TossWinner ? 1 : 2;
      } else if (decidedTo.includes('field') || decidedTo.includes('bowl')) {
        // Toss winner chose to field/bowl, so other team bats first
        teamBattingFirst = isTeam1TossWinner ? 2 : 1;
      }
    }
    
    // Map to API batting innings (1-4)
    const isTeamBattingFirst = teamNumber === teamBattingFirst;
    
    let apiBattingInnings: 1 | 2 | 3 | 4;
    if (inningsNumber === 1) {
      // First match innings: team batting first uses API batting innings 1, other uses 2
      apiBattingInnings = isTeamBattingFirst ? 1 : 2;
    } else {
      // Second match innings: team batting first uses API batting innings 3, other uses 4
      apiBattingInnings = isTeamBattingFirst ? 3 : 4;
    }
    
    return apiBattingInnings;
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
    this.getOrCreateSubject(this.inningsChangeSubjects, gameId, 1 as 1 | 2).next(match.status.currentInnings);

    // Emit batting innings specific data using loops
    for (let inningsNumber = 1; inningsNumber <= 2; inningsNumber++) {
      for (let teamNumber = 1; teamNumber <= 2; teamNumber++) {
        const innings = match.innings[inningsNumber - 1];
        const battingInnings = innings.battingInnings[teamNumber - 1];
        const key = this.getBattingInningsKey(gameId, inningsNumber as 1 | 2, teamNumber as 1 | 2);

        this.getOrCreateSubject(this.battingScorecardSubjects, key, new BattingScorecard()).next(battingInnings.battingScorecard);
        this.getOrCreateSubject(this.bowlingScorecardSubjects, key, new BowlingScorecard()).next(battingInnings.bowlingScorecard);
        this.getOrCreateSubject(this.recentOversSubjects, key, new RecentBalls()).next(battingInnings.recentOvers);
        this.getOrCreateSubject(this.fallOfWicketsSubjects, key, new FallOfWickets()).next(battingInnings.fallOfWickets);
        this.getOrCreateSubject(this.battingLineupSubjects, key, new PlayerLineup()).next(battingInnings.battingLineup);
        this.getOrCreateSubject(this.bowlingLineupSubjects, key, new PlayerLineup()).next(battingInnings.bowlingLineup);
      }
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
      concatMap(x => this.loadLineup(gameId, 'Batting', 1, 1)),
      concatMap(x => this.loadLineup(gameId, 'Batting', 1, 2)),
      concatMap(x => this.loadLineup(gameId, 'Bowling', 1, 1)),
      concatMap(x => this.loadLineup(gameId, 'Bowling', 1, 2)),
      // Load innings 1 data
      concatMap(x => this.loadRecentOvers(gameId, 1, 1)),
      concatMap(x => this.loadRecentOvers(gameId, 1, 2)),
      concatMap(x => this.loadFallOfWickets(gameId, 1, 1)),
      concatMap(x => this.loadFallOfWickets(gameId, 1, 2)),
      concatMap(x => this.loadBattingScorecard(gameId, 1, 1)),
      concatMap(x => this.loadBattingScorecard(gameId, 1, 2)),
      concatMap(x => this.loadCurrentBatters(gameId, 1, 1)),
      concatMap(x => this.loadCurrentBatters(gameId, 1, 2)),
      concatMap(x => this.loadCurrentBowlers(gameId, 1, 1)),
      concatMap(x => this.loadCurrentBowlers(gameId, 1, 2)),
      concatMap(x => this.loadBowlingScorecard(gameId, 1, 1)),
      concatMap(x => this.loadBowlingScorecard(gameId, 1, 2)),
      // Load innings 2 lineups (may return empty if not started)
      concatMap(x => this.loadLineup(gameId, 'Batting', 2, 1)),
      concatMap(x => this.loadLineup(gameId, 'Batting', 2, 2)),
      concatMap(x => this.loadLineup(gameId, 'Bowling', 2, 1)),
      concatMap(x => this.loadLineup(gameId, 'Bowling', 2, 2)),
      // Load innings 2 data (may return empty if not started)
      concatMap(x => this.loadRecentOvers(gameId, 2, 1)),
      concatMap(x => this.loadRecentOvers(gameId, 2, 2)),
      concatMap(x => this.loadFallOfWickets(gameId, 2, 1)),
      concatMap(x => this.loadFallOfWickets(gameId, 2, 2)),
      concatMap(x => this.loadBattingScorecard(gameId, 2, 1)),
      concatMap(x => this.loadBattingScorecard(gameId, 2, 2)),
      concatMap(x => this.loadCurrentBatters(gameId, 2, 1)),
      concatMap(x => this.loadCurrentBatters(gameId, 2, 2)),
      concatMap(x => this.loadCurrentBowlers(gameId, 2, 1)),
      concatMap(x => this.loadCurrentBowlers(gameId, 2, 2)),
      concatMap(x => this.loadBowlingScorecard(gameId, 2, 1)),
      concatMap(x => this.loadBowlingScorecard(gameId, 2, 2)),
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
            teamAScore.load(fixtureData);
            const keyA = this.getTeamScoreKey(gameId, inningsNumber, 1);
            this.getOrCreateSubject(this.teamScoreSubjects, keyA, new TeamScore()).next(teamAScore);
            
            // Load Team B score for this innings
            const teamBScore = new TeamScore();
            teamBScore.teamNumber = 2;
            teamBScore.load(fixtureData);
            const keyB = this.getTeamScoreKey(gameId, inningsNumber, 2);
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
            match.loadTeamIds(matches.fixtures[0]);
            this.getOrCreateSubject(this.fixtureSubjects, gameId, new Fixture()).next(match.fixture);
          }
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
  }

  private loadLineup(gameId: string, type: 'Batting' | 'Bowling', inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const teamId = this.getTeamId(match, teamNumber);
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    const battingInnings = this.getBattingInnings(match, inningsNumber, teamNumber);

    if (type == 'Batting') {
      return this.webSportsApi.getBattingLineup(gameId, teamId, inningsNumber).pipe(
        map(lineup => {
          match.loadLineup('Batting', inningsNumber, teamNumber, lineup);
          this.getOrCreateSubject(this.battingLineupSubjects, key, new PlayerLineup()).next(battingInnings.battingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getBowlingLineup(gameId, teamId, inningsNumber).pipe(
        map(lineup => {
          match.loadLineup('Bowling', inningsNumber, teamNumber, lineup);
          this.getOrCreateSubject(this.bowlingLineupSubjects, key, new PlayerLineup()).next(battingInnings.bowlingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadRecentOvers(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const teamId = this.getTeamId(match, teamNumber);
    const battingInnings = this.getBattingInnings(match, inningsNumber, teamNumber);
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    const apiBattingInnings = this.getApiBattingInnings(match, inningsNumber, teamNumber);
    
    return this.webSportsApi.getBallCountdown(gameId, teamId, apiBattingInnings).pipe(
      map(ballCountdown => {
        battingInnings.recentOvers.loadRecentOvers(ballCountdown);
        this.getOrCreateSubject(this.recentOversSubjects, key, new RecentBalls()).next(battingInnings.recentOvers);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadCurrentBatters(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const teamId = this.getTeamId(match, teamNumber);
    const battingInnings = this.getBattingInnings(match, inningsNumber, teamNumber);
    
    return this.webSportsApi.getBatsmen(gameId, teamId, inningsNumber).pipe(
      map(batsmen => {
        battingInnings.currentBatters.loadCurrentBatters(batsmen);
        battingInnings.battingScorecard.addOnStrike(batsmen);

        // Check if innings has changed (only for second team in first innings)
        if (inningsNumber === 1 && teamNumber === 2 && battingInnings.currentBatters.batters.length > 0) {
          if (match.status.currentInnings == 1) {
            match.status.currentInnings = 2;
            this.getOrCreateSubject(this.inningsChangeSubjects, gameId, 1 as 1 | 2).next(match.status.currentInnings);
          }
        }
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadFallOfWickets(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const teamId = this.getTeamId(match, teamNumber);
    const battingInnings = this.getBattingInnings(match, inningsNumber, teamNumber);
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    
    return this.webSportsApi.getFallOfWickets(gameId, teamId, inningsNumber).pipe(
      map(fallOfWickets => {
        battingInnings.fallOfWickets.loadFallOfWickets(fallOfWickets);
        this.getOrCreateSubject(this.fallOfWicketsSubjects, key, new FallOfWickets()).next(battingInnings.fallOfWickets);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadBattingScorecard(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const teamId = this.getTeamId(match, teamNumber);
    const battingInnings = this.getBattingInnings(match, inningsNumber, teamNumber);
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    
    return this.webSportsApi.getBattingScorecard(gameId, teamId, inningsNumber).pipe(
      map(scorecard => {
        battingInnings.battingScorecard.loadBattingScorcard(scorecard);
        this.getOrCreateSubject(this.battingScorecardSubjects, key, new BattingScorecard()).next(battingInnings.battingScorecard);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadBowlingScorecard(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const teamId = this.getTeamId(match, teamNumber);
    const battingInnings = this.getBattingInnings(match, inningsNumber, teamNumber);
    const key = this.getBattingInningsKey(gameId, inningsNumber, teamNumber);
    
    return this.webSportsApi.getBowlingScorecard(gameId, teamId, inningsNumber).pipe(
      map(scorecard => {
        battingInnings.bowlingScorecard.loadBowlingScorcard(scorecard);
        battingInnings.bowlingScorecard.addCurrentBowlers(battingInnings.currentBowlers);
        this.getOrCreateSubject(this.bowlingScorecardSubjects, key, new BowlingScorecard()).next(battingInnings.bowlingScorecard);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
  }

  private loadCurrentBowlers(gameId: string, inningsNumber: 1 | 2, teamNumber: 1 | 2): Observable<any> {
    const match = this.getOrCreateMatch(gameId);
    const battingInnings = this.getBattingInnings(match, inningsNumber, teamNumber);
    const apiBattingInnings = this.getApiBattingInnings(match, inningsNumber, teamNumber);
    
    return this.webSportsApi.getCurrentBowlers(gameId, apiBattingInnings).pipe(
      map(bowling => {
        battingInnings.currentBowlers.loadCurrentBowlers(bowling);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    );
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

  loadWagonWheel(gameId: string, playerId: string, matchInnings: 1 | 2, teamNumber: 1 | 2, type: 'batting' | 'bowling' = 'batting'): void {
    const match = this.getOrCreateMatch(gameId);
    const playerIdNum = parseInt(playerId);
    
    if (playerIdNum > 0) {
      // Wagon wheel API uses match innings (1 or 2), NOT batting innings chronological order
      const teamId = this.getTeamId(match, teamNumber);
      const teamIdString = String(teamId);
      
      this.webSportsApi.getWagonWheel(gameId, matchInnings, teamIdString, playerId, type).pipe(
        map(inputWagonWheel => {
          const wagonWheelType: 'Batting' | 'Bowling' = type === 'batting' ? 'Batting' : 'Bowling';
          match.wagonWheel.loadWagonWheel(teamIdString, playerIdNum, wagonWheelType, inputWagonWheel);
          this.getOrCreateSubject(this.wagonWheelSubjects, gameId, new WagonWheel()).next(match.wagonWheel);
        }),
        catchError((error: HttpErrorResponse) => this.handleError(error))
      ).subscribe();
    }
  }
}
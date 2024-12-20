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
  fixtureUpdated: BehaviorSubject<Fixture> = new BehaviorSubject<Fixture>(new Fixture);
  statusUpdated: BehaviorSubject<Status> = new BehaviorSubject<Status>(new Status);
  teamAScoreUpdated: BehaviorSubject<TeamScore> = new BehaviorSubject<TeamScore>(new TeamScore);
  teamBScoreUpdated: BehaviorSubject<TeamScore> = new BehaviorSubject<TeamScore>(new TeamScore);
  teamAbattingScorecardUpdated: BehaviorSubject<BattingScorecard> = new BehaviorSubject<BattingScorecard>(new BattingScorecard);
  teamBbattingScorecardUpdated: BehaviorSubject<BattingScorecard> = new BehaviorSubject<BattingScorecard>(new BattingScorecard);
  teamABowlingScorecardUpdated: BehaviorSubject<BowlingScorecard> = new BehaviorSubject<BowlingScorecard>(new BowlingScorecard);
  teamBBowlingScorecardUpdated: BehaviorSubject<BowlingScorecard> = new BehaviorSubject<BowlingScorecard>(new BowlingScorecard);
  innings1RecentOversUpdated: BehaviorSubject<RecentBalls> = new BehaviorSubject<RecentBalls>(new RecentBalls);
  innings2RecentOversUpdated: BehaviorSubject<RecentBalls> = new BehaviorSubject<RecentBalls>(new RecentBalls);
  innings1FallOfWicketsUpdated: BehaviorSubject<FallOfWickets> = new BehaviorSubject<FallOfWickets>(new FallOfWickets);
  innings2FallOfWicketsUpdated: BehaviorSubject<FallOfWickets> = new BehaviorSubject<FallOfWickets>(new FallOfWickets);
  runComparisonUpdated: BehaviorSubject<RunComparison> = new BehaviorSubject<RunComparison>(new RunComparison);
  wagonWheelUpdated: BehaviorSubject<WagonWheel> = new BehaviorSubject<WagonWheel>(new WagonWheel);
  teamABattingLineupUpdated: BehaviorSubject<PlayerLineup> = new BehaviorSubject<PlayerLineup>(new PlayerLineup);
  teamBBattingLineupUpdated: BehaviorSubject<PlayerLineup> = new BehaviorSubject<PlayerLineup>(new PlayerLineup);
  teamABowlingLineupUpdated: BehaviorSubject<PlayerLineup> = new BehaviorSubject<PlayerLineup>(new PlayerLineup);
  teamBBowlingLineupUpdated: BehaviorSubject<PlayerLineup> = new BehaviorSubject<PlayerLineup>(new PlayerLineup);
  inningsChange: BehaviorSubject<1 | 2> = new BehaviorSubject<1 | 2>(1);

  private gameId: string = '';
  private match: Match = new Match();
  private wagonWheelTeamId: string = '';
  private wagonWheelPlayerId: number = 0;
  private wagonWheelType: 'Batting' | 'Bowling' = 'Batting'

  constructor(public webSportsApi: WebSportsAPIService, private toasterMessage: ToasterMessageService) { }

  public loadMatch(gameId: string) {
    this.gameId = gameId;
    this.reloadMatchData();
  }

  public reloadMatchData() {
    this.loadFixture().pipe(
      concatMap(x => this.loadGameTeamIDs()),
      concatMap(x => this.loadLineup('Batting', 1)),
      concatMap(x => this.loadLineup('Batting', 2)),
      concatMap(x => this.loadLineup('Bowling', 1)),
      concatMap(x => this.loadLineup('Bowling', 2)),
      concatMap(x => this.loadRecentOvers(1)),
      concatMap(x => this.loadRecentOvers(2)),
      concatMap(x => this.loadFallOfWickets(1)),
      concatMap(x => this.loadFallOfWickets(2)),
      concatMap(x => this.loadBattingScorecard(this.match.innings1Detail)),
      concatMap(x => this.loadBattingScorecard(this.match.innings2Detail)),
      concatMap(x => this.loadCurrentBatters(1)),
      concatMap(x => this.loadCurrentBatters(2)),
      concatMap(x => this.loadCurrentBowlers(1)),
      concatMap(x => this.loadCurrentBowlers(2)),
      concatMap(x => this.loadBowlingScorecard(this.match.innings1Detail)),
      concatMap(x => this.loadBowlingScorecard(this.match.innings2Detail)),
      concatMap(x => this.loadRunComparison()),
      concatMap(x => this.loadWagonWheel(this.wagonWheelTeamId, this.wagonWheelPlayerId, this.wagonWheelType))
    ).subscribe()
  }

  private loadFixture(): Observable<any> {
    return this.webSportsApi.getFixtures(this.gameId)
      .pipe(
        map(result => {
          if (result.fixtures.length > 0) {
            let updatedMatch = result.fixtures[0];
            this.match.loadFixture(updatedMatch);
            this.fixtureUpdated.next(this.match.fixture);
            this.statusUpdated.next(this.match.status);

            this.match.teamAScore.load(updatedMatch);
            this.teamAScoreUpdated.next(this.match.teamAScore);

            this.match.teamBScore.load(updatedMatch);
            this.teamBScoreUpdated.next(this.match.teamBScore);
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

  private loadGameTeamIDs(): Observable<any> {
    return this.webSportsApi.getFixtureBySport(this.gameId)
      .pipe(
        map(matches => {
          if (matches.fixtures.length > 0) {
            this.match.loadTeamIds(matches.fixtures[0]);
            this.fixtureUpdated.next(this.match.fixture);
          }
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
  }

  private loadLineup(type: 'Batting' | 'Bowling', teamNumber: 1 | 2): Observable<any> {

    if (type == 'Batting' && teamNumber == 1) {
      return this.webSportsApi.getBattingLineup(this.gameId, this.match.fixture.teamAId).pipe(
        map(lineup => {
          this.match.loadLineup('Batting', 1, lineup);
          console.log();
          this.teamABattingLineupUpdated.next(this.match.teamABattingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
    if (type == 'Batting' && teamNumber == 2) {
      return this.webSportsApi.getBattingLineup(this.gameId, this.match.fixture.teamBId).pipe(
        map(lineup => {
          this.match.loadLineup('Batting', 2, lineup);
          this.teamBBattingLineupUpdated.next(this.match.teamBBattingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
    if (type == 'Bowling' && teamNumber == 1) {
      return this.webSportsApi.getBowlingLineup(this.gameId, this.match.fixture.teamAId).pipe(
        map(lineup => {
          this.match.loadLineup('Bowling', 1, lineup);
          this.teamABowlingLineupUpdated.next(this.match.teamABowlingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
    if (type == 'Bowling' && teamNumber == 2) {
      return this.webSportsApi.getBowlingLineup(this.gameId, this.match.fixture.teamBId).pipe(
        map(lineup => {
          this.match.loadLineup('Bowling', 2, lineup)
          this.teamBBowlingLineupUpdated.next(this.match.teamBBowlingLineup);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
    return of('');
  }

  private loadRecentOvers(innings: number): Observable<any> {
    if (innings == 1) {
      return this.webSportsApi.getBallCountdown(this.gameId, this.match.fixture.teamAId, 1).pipe(
        map(ballCountdown => {
          this.match.innings1Detail.recentOvers.loadRecentOvers(ballCountdown);
          this.innings1RecentOversUpdated.next(this.match.innings1Detail.recentOvers)
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getBallCountdown(this.gameId, this.match.fixture.teamBId, 2).pipe(
        map(ballCountdown => {
          this.match.innings2Detail.recentOvers.loadRecentOvers(ballCountdown)
          this.innings2RecentOversUpdated.next(this.match.innings2Detail.recentOvers)
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadCurrentBatters(innings: number): Observable<any> {
    if (innings == 1) {
      return this.webSportsApi.getBatsmen(this.gameId, this.match.fixture.teamAId).pipe(
        map(batsmen => {
          this.match.innings1Detail.currentBatters.loadCurrentBatters(batsmen);
          this.match.innings1Detail.battingScorecard.addOnStrike(batsmen);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getBatsmen(this.gameId, this.match.fixture.teamBId).pipe(
        map(batsmen => {
          this.match.innings2Detail.currentBatters.loadCurrentBatters(batsmen);
          this.match.innings2Detail.battingScorecard.addOnStrike(batsmen);

          if (this.match.innings2Detail.currentBatters.batters.length > 0) {
            if (this.match.status.currentInnings == 1) {
              this.match.status.currentInnings = 2;
              this.inningsChange.next(this.match.status.currentInnings);
            }
          }
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadFallOfWickets(innings: number): Observable<any> {
    if (innings == 1) {
      return this.webSportsApi.getFallOfWickets(this.gameId, this.match.fixture.teamAId).pipe(
        map(fallOfWickets => {
          this.match.innings1Detail.fallOfWickets.loadFallOfWickets(fallOfWickets);
          this.innings1FallOfWicketsUpdated.next(this.match.innings1Detail.fallOfWickets);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getFallOfWickets(this.gameId, this.match.fixture.teamBId).pipe(
        map(fallOfWickets => {
          this.match.innings2Detail.fallOfWickets.loadFallOfWickets(fallOfWickets);
          this.innings2FallOfWicketsUpdated.next(this.match.innings2Detail.fallOfWickets);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadBattingScorecard(innings: InningsDetail): Observable<any> {
    let url: string = '';
    if (innings.number == 1) {
      return this.webSportsApi.getBattingScorecard(this.gameId, this.match.fixture.teamAId).pipe(
        map(scorecard => {
          innings.battingScorecard.loadBattingScorcard(scorecard);
          this.teamAbattingScorecardUpdated.next(innings.battingScorecard);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getBattingScorecard(this.gameId, this.match.fixture.teamBId).pipe(
        map(scorecard => {
          innings.battingScorecard.loadBattingScorcard(scorecard);
          this.teamBbattingScorecardUpdated.next(innings.battingScorecard);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadBowlingScorecard(innings: InningsDetail): Observable<any> {
    if (innings.number == 1) {
      return this.webSportsApi.getBowlingScorecard(this.gameId, this.match.fixture.teamBId).pipe(
        map(scorecard => {
          innings.bowlingScorecard.loadBowlingScorcard(scorecard);
          this.match.innings1Detail.bowlingScorecard.addCurrentBowlers(this.match.innings1Detail.currentBowlers);
          this.teamBBowlingScorecardUpdated.next(innings.bowlingScorecard);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return this.webSportsApi.getBowlingScorecard(this.gameId, this.match.fixture.teamAId).pipe(
        map(scorecard => {
          innings.bowlingScorecard.loadBowlingScorcard(scorecard);
          this.match.innings2Detail.bowlingScorecard.addCurrentBowlers(this.match.innings2Detail.currentBowlers);
          this.teamABowlingScorecardUpdated.next(innings.bowlingScorecard);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    }
  }

  private loadCurrentBowlers(innings: number): Observable<any> {
    return this.webSportsApi.getCurrentBowlers(this.gameId).pipe(
      map(bowling => {
        if (innings == 1) {
          this.match.innings1Detail.currentBowlers.loadCurrentBowlers(bowling);
        }
        else {
          this.match.innings2Detail.currentBowlers.loadCurrentBowlers(bowling);
        }
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    )
  }

  private loadRunComparison(): Observable<any> {

    return this.webSportsApi.getRunComparison(this.gameId).pipe(
      map(inputRunComparison => {
        let runComparisonFactory = new RunComparisonFactory()
        this.match.runComparison = runComparisonFactory.loadRunComparison(inputRunComparison)
        this.runComparisonUpdated.next(this.match.runComparison);
      }), catchError((error: HttpErrorResponse) => this.handleError(error))
    )
  }

  public setWagonWheelPlayer(teamId: string, playerId: number, type: 'Batting' | 'Bowling') {
    this.wagonWheelTeamId = teamId;
    this.wagonWheelPlayerId = playerId;
    this.wagonWheelType = type;
    this.loadWagonWheel(teamId, playerId, type).subscribe();
  }

  private loadWagonWheel(teamId: string, playerId: number, type: 'Batting' | 'Bowling'): Observable<any> {
    if (this.wagonWheelPlayerId > 0) {
      return this.webSportsApi.getWagonWheel(this.gameId, teamId, playerId.toString(), type).pipe(
        map(inputWagonWheel => {
          this.match.wagonWheel.loadWagonWheel(teamId, playerId, type, inputWagonWheel);
          this.wagonWheelUpdated.next(this.match.wagonWheel);
        }), catchError((error: HttpErrorResponse) => this.handleError(error))
      )
    } else {
      return of(true);
    }
  }
}
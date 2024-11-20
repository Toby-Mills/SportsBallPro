import { EventEmitter, Injectable, Output } from '@angular/core';
import { Fixture, Match, Status } from '../models/match';
import { WebSportsAPIService } from './web-sports-api.service';
import { BehaviorSubject, concatMap, map, Observable } from 'rxjs';
import { TeamScore } from '../models/team-score';
import { InningsDetail } from '../models/innings-detail';
import { RunComparison, RunComparisonFactory } from '../models/run-comparison';
import { WagonWheel } from '../models/web-sports';
import { BattingScorecard, BowlingScorecard } from '../models/scorecard';
import { RecentBalls } from '../models/recent-balls';
import { FallOfWickets } from '../models/fall-of-wickets';

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
  inningsChange: BehaviorSubject<1 | 2> = new BehaviorSubject<1|2>(1);

  private gameId: string = '';
  private match: Match = new Match();

  constructor(public webSportsApi: WebSportsAPIService) { }

  public loadMatch(gameId: string) {
    this.gameId = gameId;
    this.reloadMatchData();
  }

  public reloadMatchData() {
    this.loadFixture().pipe(
      concatMap(x => this.loadGameTeamIDs()),
      concatMap(x => this.loadBattingLineup(this.match.fixture.teamAId)),
      concatMap(x => this.loadBattingLineup(this.match.fixture.teamBId)),
      concatMap(x => this.loadRecentOvers(1)),
      concatMap(x => this.loadRecentOvers(2)),
      concatMap(x => this.loadFallOfWickets(1)),
      concatMap(x => this.loadFallOfWickets(2)),
      concatMap(x => this.loadBattingScorecard(this.match.innings1Detail)),
      concatMap(x => this.loadBattingScorecard(this.match.innings2Detail)),
      concatMap(x => this.loadBowlingScorecard(this.match.innings1Detail)),
      concatMap(x => this.loadBowlingScorecard(this.match.innings2Detail)),
      concatMap(x => this.loadCurrentBatters(1)),
      concatMap(x => this.loadCurrentBatters(2)),
      concatMap(x => this.loadCurrentBowlers(1)),
      concatMap(x => this.loadCurrentBowlers(2)),
      concatMap(x => this.loadRunComparison()),
      concatMap(x => this.loadWagonWheel())
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
          
          if (this.match.innings2Detail.currentBatters.batters.length > 0) {
            if (this.match.status.currentInnings == 1) {
              this.match.status.currentInnings = 2;
              this.inningsChange.next(this.match.status.currentInnings);
            }
          }

        })
      )
  }

  private loadGameTeamIDs(): Observable<any> {
    return this.webSportsApi.getFixtureBySport(this.gameId)
      .pipe(
        map(matches => {
          if (matches.fixtures.length > 0) {
            this.match.loadTeamIds(matches.fixtures[0]);
            this.fixtureUpdated.next(this.match.fixture);
          }
        })
      )
  }

  private loadBattingLineup(teamId: string): Observable<any> {
    return this.webSportsApi.getBattingLineup(this.gameId, teamId).pipe(
      map(battingLineup => {
        this.match.loadBattingLineup(battingLineup, teamId);
      })
    )
  }

  private loadRecentOvers(innings: number): Observable<any> {
    if (innings == 1) {
      return this.webSportsApi.getBallCountdown(this.gameId, this.match.fixture.teamAId, 1).pipe(
        map(ballCountdown => {
          this.match.innings1Detail.recentOvers.loadRecentOvers(ballCountdown);
          this.innings1RecentOversUpdated.next(this.match.innings1Detail.recentOvers)
        })
      )
    } else {
      return this.webSportsApi.getBallCountdown(this.gameId, this.match.fixture.teamBId, 2).pipe(
        map(ballCountdown => {
          this.match.innings2Detail.recentOvers.loadRecentOvers(ballCountdown)
          this.innings2RecentOversUpdated.next(this.match.innings2Detail.recentOvers)
        })
      )
    }
  }

  private loadCurrentBatters(innings: number): Observable<any> {
    if (innings == 1) {
      return this.webSportsApi.getBatsmen(this.gameId, this.match.fixture.teamAId).pipe(
        map(batsmen => {
          this.match.innings1Detail.currentBatters.loadCurrentBatters(batsmen);
          this.match.innings1Detail.battingScorecard.addOnStrike(batsmen);
        }
        )
      )
    } else {
      return this.webSportsApi.getBatsmen(this.gameId, this.match.fixture.teamBId).pipe(
        map(batsmen => {
          this.match.innings2Detail.currentBatters.loadCurrentBatters(batsmen);
          this.match.innings2Detail.battingScorecard.addOnStrike(batsmen);
        }
        )
      )
    }
  }

  private loadFallOfWickets(innings: number): Observable<any> {
    if (innings == 1) {
      return this.webSportsApi.getFallOfWickets(this.gameId, this.match.fixture.teamAId).pipe(
        map(fallOfWickets => {
          this.match.innings1Detail.fallOfWickets.loadFallOfWickets(fallOfWickets);
          this.innings1FallOfWicketsUpdated.next(this.match.innings1Detail.fallOfWickets);
        })
      )
    } else {
      return this.webSportsApi.getFallOfWickets(this.gameId, this.match.fixture.teamBId).pipe(
        map(fallOfWickets => {
          this.match.innings2Detail.fallOfWickets.loadFallOfWickets(fallOfWickets);
          this.innings2FallOfWicketsUpdated.next(this.match.innings2Detail.fallOfWickets);
        })
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
        })
      )
    } else {
      return this.webSportsApi.getBattingScorecard(this.gameId, this.match.fixture.teamBId).pipe(
        map(scorecard => {
          innings.battingScorecard.loadBattingScorcard(scorecard);
          this.teamBbattingScorecardUpdated.next(innings.battingScorecard);
        })
      )
    }
  }

  private loadBowlingScorecard(innings: InningsDetail): Observable<any> {
    if (innings.number == 1) {
      return this.webSportsApi.getBowlingScorecard(this.gameId, this.match.fixture.teamBId).pipe(
        map(scorecard => {
          innings.bowlingScorecard.loadBowlingScorcard(scorecard);
          this.teamBBowlingScorecardUpdated.next(innings.bowlingScorecard);

        })
      )
    } else {
      return this.webSportsApi.getBowlingScorecard(this.gameId, this.match.fixture.teamAId).pipe(
        map(scorecard => {
          innings.bowlingScorecard.loadBowlingScorcard(scorecard);
          this.teamABowlingScorecardUpdated.next(innings.bowlingScorecard);
        })
      )
    }
  }

  private loadCurrentBowlers(innings: number): Observable<any> {
    return this.webSportsApi.getCurrentBowlers(this.gameId).pipe(
      map(bowling => {
        if (innings == 1) {
          this.match.innings1Detail.currentBowlers.loadCurrentBowlers(bowling);
          this.match.innings1Detail.bowlingScorecard.addCurrentBowlers(this.match.innings1Detail.currentBowlers);
        }
        else {
          this.match.innings2Detail.currentBowlers.loadCurrentBowlers(bowling);
          this.match.innings2Detail.bowlingScorecard.addCurrentBowlers(this.match.innings2Detail.currentBowlers);
        }
      })
    )
  }

  private loadRunComparison(): Observable<any> {

    return this.webSportsApi.getRunComparison(this.gameId).pipe(
      map(inputRunComparison => {
        let runComparisonFactory = new RunComparisonFactory()
        this.match.runComparison = runComparisonFactory.loadRunComparison(inputRunComparison)
        this.runComparisonUpdated.next(this.match.runComparison);
      })
    )
  }

  private loadWagonWheel(): Observable<any> {
    return this.webSportsApi.getWagonWheel(this.gameId, this.match.fixture.teamAId).pipe(
      map(inputWagonWheel => {
        this.match.wagonWheel = inputWagonWheel;
        this.wagonWheelUpdated.next(this.match.wagonWheel);
      })
    );
  }
}

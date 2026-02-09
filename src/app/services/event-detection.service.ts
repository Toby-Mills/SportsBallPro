import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';
import { pairwise } from 'rxjs/operators';
import { MatchService } from './match.service';
import { EventType, NotificationEvent } from '../models/notification-event';
import { TeamScore } from '../models/team-score';
import { Fixture, Status } from '../models/match';
import { BattingScorecard } from '../models/scorecard';
import { RecentBalls } from '../models/recent-balls';
import { BallByBallCommentary } from '../models/ball-commentary';
import { Partnership } from '../models/partnership';

@Injectable({
  providedIn: 'root'
})
export class EventDetectionService {
  private eventSubjects = new Map<string, Subject<NotificationEvent>>();
  private subscriptions = new Map<string, Subscription>();
  private eventCounter = 0;
  private fixturesByGameId = new Map<string, Fixture>();

  constructor(private matchService: MatchService) {}

  startMonitoring(gameId: string): Observable<NotificationEvent> {
    const existing = this.eventSubjects.get(gameId);
    if (existing) {
      return existing.asObservable();
    }

    const subject = new Subject<NotificationEvent>();
    this.eventSubjects.set(gameId, subject);

    const subscription = new Subscription();

    subscription.add(
      this.matchService
        .getTeamAScoreUpdates(gameId)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleTeamScoreChange(gameId, previous, current, subject);
        })
    );

    subscription.add(
      this.matchService
        .getTeamBScoreUpdates(gameId)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleTeamScoreChange(gameId, previous, current, subject);
        })
    );

	subscription.add(
      this.matchService
        .getBattingInningsChangeUpdates(gameId)
        .subscribe((battingInningsNumber) => {
			const fixture = this.fixturesByGameId.get(gameId);
			const teamName = battingInningsNumber % 2 === 1 ? fixture?.teamAName : fixture?.teamBName;
			const message = teamName ?
			  `${teamName} batting innings started`
              : 'Batting innings started';
		   subject.next(
              this.createEvent(gameId, EventType.INNINGS_CHANGE, message, message, teamName)
            );
		})
	);

    subscription.add(
      this.matchService
        .getFixtureUpdates(gameId)
        .subscribe(fixture => {
          this.fixturesByGameId.set(gameId, fixture);
        })
    );

    subscription.add(
      this.matchService
        .getStatusUpdates(gameId)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleStatusChange(gameId, previous, current, subject);
        })
    );

    // Subscribe to batting scorecard updates for batsman milestones, boundaries, partnerships
    // All 4 batting innings
    subscription.add(
      this.matchService
        .getBattingScorecardUpdates(gameId, 1)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleBattingScorecardChange(gameId, previous, current, subject);
        })
    );

    subscription.add(
      this.matchService
        .getBattingScorecardUpdates(gameId, 2)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleBattingScorecardChange(gameId, previous, current, subject);
        })
    );

    subscription.add(
      this.matchService
        .getBattingScorecardUpdates(gameId, 3)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleBattingScorecardChange(gameId, previous, current, subject);
        })
    );

    subscription.add(
      this.matchService
        .getBattingScorecardUpdates(gameId, 4)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleBattingScorecardChange(gameId, previous, current, subject);
        })
    );

    // Subscribe to ball-by-ball commentary for detailed event detection
    // All 4 batting innings
    subscription.add(
      this.matchService
        .getBallByBallCommentaryUpdates(gameId, 1)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleBallByBallCommentaryChange(gameId, previous, current, subject);
        })
    );

    subscription.add(
      this.matchService
        .getBallByBallCommentaryUpdates(gameId, 2)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleBallByBallCommentaryChange(gameId, previous, current, subject);
        })
    );

    // Innings 2: both teams
    subscription.add(
      this.matchService
        .getBallByBallCommentaryUpdates(gameId, 3)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleBallByBallCommentaryChange(gameId, previous, current, subject);
        })
    );

    subscription.add(
      this.matchService
        .getBallByBallCommentaryUpdates(gameId, 4)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handleBallByBallCommentaryChange(gameId, previous, current, subject);
        })
    );

    // Subscribe to partnership updates for milestone detection
    // All 4 batting innings
    subscription.add(
      this.matchService
        .getPartnershipUpdates(gameId, 1)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handlePartnershipChange(gameId, previous, current, subject);
        })
    );

    subscription.add(
      this.matchService
        .getPartnershipUpdates(gameId, 2)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handlePartnershipChange(gameId, previous, current, subject);
        })
    );

    // Innings 2: both teams
    subscription.add(
      this.matchService
        .getPartnershipUpdates(gameId, 3)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handlePartnershipChange(gameId, previous, current, subject);
        })
    );

    subscription.add(
      this.matchService
        .getPartnershipUpdates(gameId, 4)
        .pipe(pairwise())
        .subscribe(([previous, current]) => {
          this.handlePartnershipChange(gameId, previous, current, subject);
        })
    );

    this.subscriptions.set(gameId, subscription);
    return subject.asObservable();
  }

  stopMonitoring(gameId: string): void {
    const subscription = this.subscriptions.get(gameId);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(gameId);
    }

    const subject = this.eventSubjects.get(gameId);
    if (subject) {
      subject.complete();
      this.eventSubjects.delete(gameId);
    }
  }

  private handleTeamScoreChange(
    gameId: string,
    previous: TeamScore,
    current: TeamScore,
    subject: Subject<NotificationEvent>
  ): void {
    if (!current.teamName) {
      return;
    }

    if (current.wickets > previous.wickets) {
      const wicketsLost = current.wickets - previous.wickets;
      const scoreline = `${current.runs}/${current.wickets} in ${current.overs} ov`;
      const title = wicketsLost === 1
        ? `${current.teamName} lost a wicket (${scoreline})`
        : `${current.teamName} lost ${wicketsLost} wickets (${scoreline})`;
      const description = `${current.teamName} lost a wicket (${scoreline})`;

      subject.next(
        this.createEvent(gameId, EventType.WICKET, title, description, current.teamName, undefined, current.wickets)
      );
    }

    const milestonesCrossed = this.getMilestonesCrossed(previous.runs, current.runs);
    if (milestonesCrossed.length > 0) {
      const milestone = Math.max(...milestonesCrossed);
      const title = `${milestone} up for ${current.teamName}`;
      const description = `${milestone} up for ${current.teamName} (${current.runs}/${current.wickets} in ${current.overs} ov)`;
      subject.next(
        this.createEvent(gameId, EventType.MILESTONE_TEAM, title, description, current.teamName, undefined, milestone)
      );
    }
  }

  private handleStatusChange(
    gameId: string,
    previous: Status,
    current: Status,
    subject: Subject<NotificationEvent>
  ): void {
    if (!previous.result && current.result && current.result !== 'Fixture') {
      subject.next(
        this.createEvent(gameId, EventType.MATCH_STATUS, 'Match result', current.result)
      );
    }
  }

  private getMilestonesCrossed(previousRuns: number, currentRuns: number): number[] {
    if (currentRuns < 50) {
      return [];
    }

    const start = Math.max(50, Math.floor(previousRuns / 50) * 50 + 50);
    const end = Math.floor(currentRuns / 50) * 50;
    if (end < 50 || start > end) {
      return [];
    }

    const milestones: number[] = [];
    for (let milestone = start; milestone <= end; milestone += 50) {
      milestones.push(milestone);
    }
    return milestones;
  }

  private handleBattingScorecardChange(
    gameId: string,
    previous: BattingScorecard,
    current: BattingScorecard,
    subject: Subject<NotificationEvent>
  ): void {
    const previousRunsById = new Map<string, number>();
    previous.batters.forEach(batter => {
      if (batter.id) {
        previousRunsById.set(batter.id, batter.runs || 0);
      }
    });

    current.batters.forEach(batter => {
      const batterId = batter.id;
      if (!batterId) {
        return;
      }

      const previousRuns = previousRunsById.get(batterId) ?? 0;
      const currentRuns = batter.runs || 0;
      if (currentRuns <= previousRuns) {
        return;
      }

      const milestonesCrossed = this.getMilestonesCrossed(previousRuns, currentRuns);
      if (milestonesCrossed.length === 0) {
        return;
      }

      const milestone = Math.max(...milestonesCrossed);
      const playerName = `${batter.firstname} ${batter.surname}`.trim();
      const title = `${playerName} reached ${milestone}`;
      const description = `${milestone} up for ${playerName} (${currentRuns} in ${batter.balls} balls)`;
      subject.next(
        this.createEvent(
          gameId,
          EventType.MILESTONE_BATSMAN,
          title,
          description,
          undefined,
          playerName,
          milestone
        )
      );
    });
  }

  private handleBallByBallCommentaryChange(
    gameId: string,
    previous: BallByBallCommentary,
    current: BallByBallCommentary,
    subject: Subject<NotificationEvent>
  ): void {
    // Build map of previous overs by overIndex for comparison
    const previousOversMap = new Map<number, number>(); // overIndex -> legal ball count
    previous.overs.forEach(over => {
      const legalBalls = over.balls.filter(b => !b.isExtra).length;
      previousOversMap.set(over.overIndex, legalBalls);
    });

    // Check for newly completed overs (maiden over detection)
    current.overs.forEach(over => {
      const legalBalls = over.balls.filter(b => !b.isExtra).length;
      const previousLegalBalls = previousOversMap.get(over.overIndex) ?? 0;

      // Over is newly completed if it now has 6 legal balls but didn't before
      if (legalBalls >= 6 && previousLegalBalls < 6) {
        // Check if it's a maiden (0 runs conceded)
        if (over.totalRuns === 0) {
          const bowlerName = over.bowlerName || 'Bowler';
          const title = `Maiden over by ${bowlerName}`;
          const description = `${bowlerName} bowled a maiden over (over ${over.overNumber})`;
          subject.next(
            this.createEvent(gameId, EventType.MAIDEN_OVER, title, description, undefined, bowlerName)
          );
        }
      }
    });

    // TODO: Detect boundaries from commentary description (4 or 6)

    // Detect hat-trick: 3 consecutive wickets by the same bowler
    this.detectHatTrick(gameId, previous, current, subject);

    // TODO: Parse commentary text for special events (catches, run outs, etc.)
  }

  private detectHatTrick(
    gameId: string,
    previous: BallByBallCommentary,
    current: BallByBallCommentary,
    subject: Subject<NotificationEvent>
  ): void {
    // Get all balls sorted chronologically by eventId
    const allCurrentBalls = current.overs
      .flatMap(over => over.balls)
      .sort((a, b) => a.eventId - b.eventId);

    const allPreviousBalls = previous.overs
      .flatMap(over => over.balls)
      .sort((a, b) => a.eventId - b.eventId);

    // Find previous event IDs to identify new balls
    const previousEventIds = new Set(allPreviousBalls.map(b => b.eventId));

    // Group all current balls by bowler
    const ballsByBowler = new Map<number, typeof allCurrentBalls>();
    allCurrentBalls.forEach(ball => {
      if (!ball.bowlerPlayerId) return;
      const existing = ballsByBowler.get(ball.bowlerPlayerId) || [];
      existing.push(ball);
      ballsByBowler.set(ball.bowlerPlayerId, existing);
    });

    // Check each bowler's deliveries for hat-trick
    for (const [, bowlerBalls] of ballsByBowler) {
      if (bowlerBalls.length < 3) continue;

      // Check for 3 consecutive wickets in this bowler's deliveries
      for (let i = 0; i <= bowlerBalls.length - 3; i++) {
        const ball1 = bowlerBalls[i];
        const ball2 = bowlerBalls[i + 1];
        const ball3 = bowlerBalls[i + 2];

        // All 3 must be wickets
        if (!ball1.isWicket || !ball2.isWicket || !ball3.isWicket) {
          continue;
        }

        // Check if this hat-trick is newly completed
        // Trigger if the completing ball (ball3) is new
        if (previousEventIds.has(ball3.eventId)) {
          continue;
        }

        // Get bowler name from commentary (format: "BowlerName to BatterName")
        const bowlerMatch = ball3.commentary.match(/^([^:]+) to/);
        const bowlerName = bowlerMatch ? bowlerMatch[1].trim() : 'Bowler';

        const title = `HAT-TRICK by ${bowlerName}!`;
        const description = `${bowlerName} has taken a hat-trick!`;
        subject.next(
          this.createEvent(gameId, EventType.HAT_TRICK, title, description, undefined, bowlerName, 3)
        );

        // Only emit one hat-trick notification per update
        return;
      }
    }
  }

  private handlePartnershipChange(
    gameId: string,
    previous: Partnership[],
    current: Partnership[],
    subject: Subject<NotificationEvent>
  ): void {
    // Build map of previous partnership runs by wicket number
    const previousRunsMap = new Map<number, number>();
    previous.forEach(p => previousRunsMap.set(p.wicketNumber, p.runs));

    // Check each current partnership for milestone crossings
    current.forEach(partnership => {
      const previousRuns = previousRunsMap.get(partnership.wicketNumber) ?? 0;
      const currentRuns = partnership.runs;

      if (currentRuns <= previousRuns) {
        return;
      }

      const milestonesCrossed = this.getMilestonesCrossed(previousRuns, currentRuns);
      if (milestonesCrossed.length === 0) {
        return;
      }

      // Only emit for the highest milestone crossed
      const milestone = Math.max(...milestonesCrossed);
      const batters = [partnership.batter1Name, partnership.batter2Name]
        .filter(name => name)
        .join(' and ');
      
      const title = `${milestone} partnership!`;
      const description = batters
        ? `${batters} have put on ${currentRuns} runs together`
        : `Partnership has reached ${currentRuns} runs`;

      subject.next(
        this.createEvent(
          gameId,
          EventType.MILESTONE_PARTNERSHIP,
          title,
          description,
          undefined,
          batters,
          milestone
        )
      );
    });
  }

  private createEvent(
    gameId: string,
    eventType: EventType,
    title: string,
    description: string,
    team?: string,
    player?: string,
    value?: number
  ): NotificationEvent {
    return {
      id: `${gameId}-${eventType}-${Date.now()}-${this.eventCounter++}`,
      gameId,
      timestamp: new Date(),
      eventType,
      title,
      description,
      team,
      player,
      value
    };
  }
}

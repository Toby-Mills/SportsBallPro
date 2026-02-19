import { CommentaryAPI } from './web-sports';

export class BallByBallCommentary {
  gameId: string = '';
  teamId: string = '';
  innings: number = 0;
  overs: OverCommentary[] = [];

  public loadFromAPI(input: CommentaryAPI): void {
    this.overs = [];

    if (input.commentary) {
      const oversMap = new Map<number, BallCommentary[]>();

      for (let apiBall of input.commentary) {
        const newBall = new BallCommentary();
        newBall.eventId = apiBall.EventID;
        newBall.overIndex = apiBall.currOver;
        newBall.overNumber = apiBall.currOver + 1;
        newBall.over = apiBall.Over;
        newBall.ballNumber = this.parseBallNumber(apiBall.Over);
        newBall.commentary = apiBall.BallNote;
        newBall.description = apiBall.BallDescription;
        newBall.bowlerPlayerId = apiBall.PlayerIDBowling;
        newBall.teamRuns = apiBall.TeamTotalRuns;
        newBall.teamWickets = apiBall.TeamTotalWickets;
        newBall.bowlerOvers = apiBall.BowlerTotalOvers;
        newBall.bowlerRuns = apiBall.BowlerTotalRuns;
        newBall.bowlerWickets = apiBall.BowlerTotalWickets;

        if (!oversMap.has(newBall.overIndex)) {
          oversMap.set(newBall.overIndex, []);
        }
        oversMap.get(newBall.overIndex)!.push(newBall);
      }

      oversMap.forEach((balls, overIndex) => {
        const over = new OverCommentary();
        over.overIndex = overIndex;
        over.overNumber = overIndex + 1;
        // Keep newest-first order within the over
        over.balls = balls;
        over.balls.sort((a, b) => b.eventId - a.eventId);
        this.overs.push(over);
      });

      this.overs.sort((a, b) => a.overIndex - b.overIndex);
    }
  }

  private parseBallNumber(over: string): number {
    const parts = over.split('.');
    if (parts.length < 2) {
      return 0;
    }
    const parsed = Number(parts[1]);
    return Number.isNaN(parsed) ? 0 : parsed;
  }

  clone(): BallByBallCommentary {
    const copy = new BallByBallCommentary();
    copy.gameId = this.gameId;
    copy.teamId = this.teamId;
    copy.innings = this.innings;
    copy.overs = this.overs.map(over => over.clone());
    return copy;
  }
}

export class OverCommentary {
  overIndex: number = 0;
  overNumber: number = 0;
  balls: BallCommentary[] = [];

  get totalRuns(): number {
    return this.balls.reduce((sum, ball) => sum + ball.runs, 0);
  }

  get hasWicket(): boolean {
    return this.balls.some(ball => ball.isWicket);
  }

  get bowlerName(): string {
    if (this.balls.length > 0) {
      const match = this.balls[0].commentary.match(/^([^:]+) to/);
      return match ? match[1].trim() : '';
    }
    return '';
  }

  get batterName(): string {
    if (this.balls.length > 0) {
      const match = this.balls[0].commentary.match(/to ([^:(]+)/);
      return match ? match[1].trim() : '';
    }
    return '';
  }

  get summary(): string {
    const runs = this.totalRuns;
    const wickets = this.balls.filter(b => b.isWicket).length;
    return wickets > 0
      ? `${runs} run${runs !== 1 ? 's' : ''}, ${wickets} wicket${wickets > 1 ? 's' : ''}`
      : `${runs} run${runs !== 1 ? 's' : ''}`;
  }

  clone(): OverCommentary {
    const copy = new OverCommentary();
    copy.overIndex = this.overIndex;
    copy.overNumber = this.overNumber;
    copy.balls = this.balls.map(ball => ball.clone());
    return copy;
  }
}

export class BallCommentary {
  eventId: number = 0;
  overIndex: number = 0;
  overNumber: number = 0;
  over: string = '';
  ballNumber: number = 0;
  commentary: string = '';
  description: string = '';
  bowlerPlayerId: number = 0;
  teamRuns: number = 0;
  teamWickets: number = 0;
  bowlerOvers: number = 0;
  bowlerRuns: number = 0;
  bowlerWickets: number = 0;

  get isWicket(): boolean {
    return this.description === 'W';
  }

  get isExtra(): boolean {
    return ['WB', 'NB', 'LB', 'B'].some(extra => this.description.includes(extra));
  }

  get runs(): number {
    // Extract leading numeric value from description (e.g., "2" from "2LB", "4" from "4", "0" from "0", "0" from "WB")
    const match = this.description.match(/^(\d+)/);
    const numericValue = match ? parseInt(match[1], 10) : 0;
    const extraValue = ['WB', 'NB'].reduce((sum, extra) => this.description.includes(extra) ? sum + 1 : sum, 0);
    return numericValue + extraValue;
  }

  clone(): BallCommentary {
    const copy = new BallCommentary();
    copy.eventId = this.eventId;
    copy.overIndex = this.overIndex;
    copy.overNumber = this.overNumber;
    copy.over = this.over;
    copy.ballNumber = this.ballNumber;
    copy.commentary = this.commentary;
    copy.description = this.description;
    copy.bowlerPlayerId = this.bowlerPlayerId;
    copy.teamRuns = this.teamRuns;
    copy.teamWickets = this.teamWickets;
    copy.bowlerOvers = this.bowlerOvers;
    copy.bowlerRuns = this.bowlerRuns;
    copy.bowlerWickets = this.bowlerWickets;
    return copy;
  }
}
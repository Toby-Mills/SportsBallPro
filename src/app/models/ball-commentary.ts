import { Commentary } from './web-sports';

export class BallByBallCommentary {
  gameId: string = '';
  teamId: string = '';
  innings: number = 0;
  overs: OverCommentary[] = [];

  public loadCommentary(gameId: string, teamId: string, innings: number, input: Commentary): void {
    this.gameId = gameId;
    this.teamId = teamId;
    this.innings = innings;
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
    return ['WB', 'NB', 'LB'].some(extra => this.description.includes(extra));
  }

  get runs(): number {
    const num = parseInt(this.description, 10);
    return Number.isNaN(num) ? 0 : num;
  }
}

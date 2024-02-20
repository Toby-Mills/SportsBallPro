export interface Ball {
    Over: number;
    BallDescription: string; 
  }

export class RecentBalls {
    ballcountdown: Ball[] = [];
}

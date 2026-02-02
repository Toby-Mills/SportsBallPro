import { CurrentBatters } from "./current-batters";
import { CurrentBowlers } from "./current-bowlers";
import { FallOfWickets } from "./fall-of-wickets";
import { RecentBalls } from "./recent-balls";
import { BattingScorecard, BowlingScorecard } from "./scorecard";
import { PlayerLineup } from "./match";
import { BallByBallCommentary } from "./ball-commentary";

export class BattingInningsDetail {
    teamNumber: number = 0;  // 1 or 2
    recentOvers: RecentBalls = new RecentBalls;
    fallOfWickets: FallOfWickets = new FallOfWickets;
    currentBatters: CurrentBatters = new CurrentBatters;
    currentBowlers: CurrentBowlers = new CurrentBowlers;
    battingScorecard: BattingScorecard = new BattingScorecard;
    bowlingScorecard: BowlingScorecard = new BowlingScorecard;
    battingLineup: PlayerLineup = new PlayerLineup;
    bowlingLineup: PlayerLineup = new PlayerLineup;
    ballByBallCommentary: BallByBallCommentary = new BallByBallCommentary;
}

// Keep old class name for backwards compatibility during transition
export class InningsDetail extends BattingInningsDetail {}

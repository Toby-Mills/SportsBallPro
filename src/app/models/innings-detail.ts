import { CurrentBatters } from "./current-batters";
import { CurrentBowlers } from "./current-bowlers";
import { FallOfWickets } from "./fall-of-wickets";
import { RecentBalls } from "./recent-balls";
import { BattingScorecard, BowlingScorecard } from "./scorecard";

export class InningsDetail {
    number: number = 0;
    recentOvers: RecentBalls = new RecentBalls;
    fallOfWickets: FallOfWickets = new FallOfWickets;
    currentBatters: CurrentBatters = new CurrentBatters;
    currentBowlers: CurrentBowlers = new CurrentBowlers;
    battingScorecard: BattingScorecard = new BattingScorecard;
    bowlingScorecard: BowlingScorecard = new BowlingScorecard;
}

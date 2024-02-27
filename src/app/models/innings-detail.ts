import { CurrentBatters } from "./current-batters";
import { CurrentBowlers } from "./current-bowlers";
import { FallOfWickets } from "./fall-of-wickets";
import { RecentBalls } from "./recent-balls";

export class InningsDetail {
    recentOvers: RecentBalls = new RecentBalls;
    fallOfWickets: FallOfWickets = new FallOfWickets;
    currentBatters: CurrentBatters = new CurrentBatters;
    currentBowlers: CurrentBowlers = new CurrentBowlers;
}

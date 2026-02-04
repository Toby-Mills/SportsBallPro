import { CurrentBatters } from "./current-batters";
import { CurrentBowlers } from "./current-bowlers";
import { FallOfWickets } from "./fall-of-wickets";
import { RecentBalls } from "./recent-balls";
import { BattingScorecard, BowlingScorecard } from "./scorecard";
import { BallByBallCommentary } from "./ball-commentary";
import { PlayerAPI, BattingLineupAPI, BowlingLineupAPI } from "./web-sports";

export class Player {
    playerId: number = 0
    number: number = 0
    firstName: string = ''
    surname: string = ''
    
    /**
     * Load and transform from API model
     */
    public loadFromAPI(input: PlayerAPI): void {
        this.playerId = input.PlayerID;
        this.number = input.Number;
        this.firstName = input.PlayerName;
        this.surname = input.PlayerSurname;
    }
}

export class PlayerLineup {
    lineup: Array<Player> = []
    
    /**
     * Load and transform from API model
     */
    public loadFromAPI(input: BattingLineupAPI | BowlingLineupAPI): void {
        this.lineup = [];
        if (input.team) {
            for (let apiPlayer of input.team) {
                const player = new Player();
                player.loadFromAPI(apiPlayer);
                this.lineup.push(player);
            }
        }
    }
}

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

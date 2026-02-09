import { CurrentBatters } from "./current-batters";
import { CurrentBowlers } from "./current-bowlers";
import { FallOfWickets } from "./fall-of-wickets";
import { RecentBalls } from "./recent-balls";
import { BattingScorecard, BowlingScorecard } from "./scorecard";
import { BallByBallCommentary } from "./ball-commentary";
import { Partnership } from "./partnership";
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
    teamNumber: 1 | 2 = 1;  // 1 or 2
    matchInningsNumber: 1 | 2 = 1; // 1 or 2
    recentOvers: RecentBalls = new RecentBalls;
    fallOfWickets: FallOfWickets = new FallOfWickets;
    currentBatters: CurrentBatters = new CurrentBatters;
    currentBowlers: CurrentBowlers = new CurrentBowlers;
    battingScorecard: BattingScorecard = new BattingScorecard;
    bowlingScorecard: BowlingScorecard = new BowlingScorecard;
    battingLineup: PlayerLineup = new PlayerLineup;
    bowlingLineup: PlayerLineup = new PlayerLineup;
    ballByBallCommentary: BallByBallCommentary = new BallByBallCommentary;
    partnerships: Partnership[] = [];

    constructor(matchInningsNumber: 1 | 2, teamNumber: 1 | 2) {
        if (matchInningsNumber !== undefined) this.matchInningsNumber = matchInningsNumber;
        if (teamNumber !== undefined) this.teamNumber = teamNumber;
    }

    static forIndex(i: number): BattingInningsDetail {
        
        const matchInningsNumber = (i > 2 ? 2 : 1) as 1 | 2;
        const teamNumber = (i <= 2 ? i : i - 2) as 1 | 2;
        const battingInnings = new BattingInningsDetail(matchInningsNumber, teamNumber);
        return battingInnings;
    }

    /**
     * Calculate partnerships from ball-by-ball commentary.
     * Partnerships are derived by tracking team runs between wickets.
     */
    calculatePartnerships(): void {
        this.partnerships = [];

        const allBalls = this.ballByBallCommentary.overs
            .flatMap(over => over.balls)
            .sort((a, b) => a.eventId - b.eventId);

        if (allBalls.length === 0) {
            return;
        }

        let currentPartnership = new Partnership();
        currentPartnership.wicketNumber = 0;
        currentPartnership.isActive = true;
        currentPartnership.startTeamRuns = 0;

        // Track batter names from commentary
        let currentBatters: { id: string; name: string }[] = [];

        for (const ball of allBalls) {
            // Parse batter name from commentary (format: "BowlerName to BatterName")
            const batterMatch = ball.commentary.match(/to ([^,:(]+)/);
            const batterName = batterMatch ? batterMatch[1].trim() : '';

            if (batterName && !currentBatters.some(b => b.name === batterName)) {
                // New batter at the crease
                if (currentBatters.length < 2) {
                    currentBatters.push({ id: '', name: batterName });
                }
            }

            // Update partnership batter names
            if (currentBatters.length >= 1 && !currentPartnership.batter1Name) {
                currentPartnership.batter1Name = currentBatters[0].name;
            }
            if (currentBatters.length >= 2 && !currentPartnership.batter2Name) {
                currentPartnership.batter2Name = currentBatters[1].name;
            }

            // Update current partnership runs
            currentPartnership.runs = ball.teamRuns - currentPartnership.startTeamRuns;

            // Check for wicket
            if (ball.isWicket) {
                // Close current partnership
                currentPartnership.isActive = false;
                currentPartnership.endTeamRuns = ball.teamRuns;
                this.partnerships.push(currentPartnership);

                // Start new partnership
                const nextPartnership = new Partnership();
                nextPartnership.wicketNumber = currentPartnership.wicketNumber + 1;
                nextPartnership.isActive = true;
                nextPartnership.startTeamRuns = ball.teamRuns;

                // Remove dismissed batter, keep non-striker
                // The batter facing is likely the one dismissed
                currentBatters = currentBatters.filter(b => b.name !== batterName);

                // Carry over the remaining batter as batter1 (they started first in this partnership)
                if (currentBatters.length > 0) {
                    nextPartnership.batter1Name = currentBatters[0].name;
                }

                currentPartnership = nextPartnership;
            }
        }

        // Add the current (active) partnership if it has runs or batters
        if (currentPartnership.runs > 0 || currentPartnership.batter1Name) {
            this.partnerships.push(currentPartnership);
        }
    }
}

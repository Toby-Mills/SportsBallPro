export class BattingScorecard {
    batters: BattingScorecardEntry[] = [];
    stillToBat: String[] = [];

    public loadBattingScorcard(input: any) {
        this.batters = [];
        this.stillToBat = [];

        for (let batter of input.scorecard) {
            if (batter.HowOutFull == '' || batter.HowOutFull == 'dnb') {
                this.stillToBat.push(`${batter.PlayerName} ${batter.PlayerSurname}`)
            } else {
                let newBatter = new BattingScorecardEntry;
                newBatter.firstname = batter.PlayerName;
                newBatter.surname = batter.PlayerSurname;
                newBatter.batterNumber = batter.BattingNr;
                newBatter.wicketTaker = batter.WicketTaker;
                newBatter.runs = batter.BatRuns || 0;
                newBatter.balls = batter.BatBalls || 0;
                newBatter.fielder = batter.Fielder;
                newBatter.fours = batter.Fours || 0;
                newBatter.sixes = batter.Sixes || 0;
                newBatter.howOut = batter.HowOut;
                newBatter.howOutFull = batter.HowOutFull;
                this.batters.push(newBatter)
            }
        }
    }
}

export class BattingScorecardEntry {
    firstname: string = '';
    surname: string = '';
    batterNumber: number = 0;
    wicketTaker: string = '';
    runs: number = 0;
    balls: number = 0;
    fielder: string = '';
    fours: number = 0;
    sixes: number = 0;
    howOut: string = '';
    howOutFull: string = '';
}

export class BowlingScorecard {
    bowlers: BowlingScorecardEntry[] = [];

    public loadBowlingScorcard(input: any) {
        this.bowlers = [];

        for (let bowler of input.scorecard) {
            let newBowler = new BowlingScorecardEntry;
            newBowler.firstname = bowler.PlayerName;
            newBowler.surname = bowler.PlayerSurname;
            newBowler.bowlerNumber = bowler.BowlNr;
            newBowler.overs = bowler.OversBowled;
            newBowler.maidens = bowler.MaidensBowled;
            newBowler.runs = bowler.RunsAgainst;
            newBowler.wickets = bowler.Wickets;
            newBowler.noBalls = bowler.NoBalls;
            newBowler.wides = bowler.Wides;
            newBowler.totalBalls = bowler.TotalBowlerBalls;
            this.bowlers.push(newBowler)
        }
    }
}

export class BowlingScorecardEntry {
    firstname: string = '';
    surname: string = '';
    bowlerNumber: number = 0;
    overs: number = 0;
    maidens: number = 0;
    runs: string = '';
    wickets: number = 0;
    noBalls: number = 0;
    wides: number = 0;
    totalBalls: number = 0;
}
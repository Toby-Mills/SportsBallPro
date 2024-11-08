import { CurrentBowlers } from "./current-bowlers";

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
                newBatter.id = batter.ServerPlayerID;
                newBatter.firstname = batter.PlayerName;
                newBatter.surname = batter.PlayerSurname;
                newBatter.batterNumber = batter.BattingNr;
                newBatter.wicketTaker = batter.WicketTaker;
                newBatter.runs = batter.BatRuns || 0;
                newBatter.balls = batter.BatBalls || 0;
                newBatter.fielder = batter.Fielder;
                newBatter.fours = batter.BatFours || 0;
                newBatter.sixes = batter.BatSixes || 0;
                newBatter.howOut = batter.HowOut;
                newBatter.howOutFull = batter.HowOutFull;
                newBatter.batting = (newBatter.howOutFull == 'n/o');
                if (newBatter.balls > 0) {
                    newBatter.strikeRate = (newBatter.runs / newBatter.balls) * 100;
                }
                this.batters.push(newBatter)
            }
        }
    }

    public addOnStrike(input: any) {
        for (let batter of input.batsmen) {
            let id = batter.ServerPlayerID;
            if (id > 0) {
                let foundBatter = this.batters.find(batter => batter.id == id)
                if (foundBatter) {
                    foundBatter.batting = true;
                    foundBatter.onStrike = (batter.CurrentPlayer == 'OnStrike')
                }
            }

        }
    }

}

export class BattingScorecardEntry {
    id: number = 0;
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
    strikeRate: number = 0;
    batting: boolean = false;
    onStrike: boolean = false;
}

export class BowlingScorecard {
    bowlers: BowlingScorecardEntry[] = [];

    public loadBowlingScorcard(input: any) {
        this.bowlers = [];

        for (let bowler of input.scorecard) {
            let newBowler = new BowlingScorecardEntry;
            newBowler.serverPlayerID = bowler.ServerPlayerID;
            newBowler.firstname = bowler.PlayerName;
            newBowler.surname = bowler.PlayerSurname;
            newBowler.bowlerNumber = bowler.BowlNr;
            newBowler.overs = bowler.OversBowled;
            newBowler.maidens = bowler.MaidensBowled;
            newBowler.runs = bowler.RunsAgainst;
            newBowler.wickets = bowler.Wickets;
            newBowler.noBalls = bowler.NoBalls;
            newBowler.wides = bowler.Wides;
            newBowler.extras = newBowler.wides + newBowler.noBalls;
            newBowler.totalBalls = bowler.TotalBowlerBalls;
            if (newBowler.totalBalls > 0) {
                newBowler.economy = (newBowler.runs / (newBowler.totalBalls)) * 6;
            }
            this.bowlers.push(newBowler)
        }
    }


    public addCurrentBowlers(input: CurrentBowlers) {
        //update the Bowling Scorecard to reflect who the current bowlers are

        //Strike Bowler
        let strikeBowlerInput = input.bowlers.find(a => a.currentPlayer == 'BowlOn');
        let strikeBowler = this.bowlers.find(a => a.serverPlayerID === strikeBowlerInput?.serverPlayerID);
        if (strikeBowler) {
            strikeBowler.strikeBowler = true;
        }

        //Non-Strike Bowler
        let nonStrikeBowlerInput = input.bowlers.find(a => a.currentPlayer == 'NotOn');
        let nonStrikeBowler = this.bowlers.find(a => a.serverPlayerID === nonStrikeBowlerInput?.serverPlayerID);
        if (nonStrikeBowler) {
            nonStrikeBowler.nonStrikeBowler = true;
        }
    }
}

export class BowlingScorecardEntry {
    serverPlayerID: number = 0;
    firstname: string = '';
    surname: string = '';
    bowlerNumber: number = 0;
    overs: number = 0;
    maidens: number = 0;
    runs: number = 0;
    wickets: number = 0;
    noBalls: number = 0;
    wides: number = 0;
    extras: number = 0;
    totalBalls: number = 0;
    economy: number = 0;
    strikeBowler: boolean = false;
    nonStrikeBowler: boolean = false;
}
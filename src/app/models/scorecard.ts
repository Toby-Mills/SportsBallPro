import { CurrentBowlers } from "./current-bowlers";
import { BatsmenAPI, BattingScorecardAPI as WebSportsBattingScorecard, BowlingScorecardAPI as WebSportsBowlingScorecard } from './web-sports';

export class BattingScorecard {
    batters: BattingScorecardEntry[] = [];
    hasCurrentBatters: boolean = false;
    stillToBat: String[] = [];

    public loadFromAPI(input: WebSportsBattingScorecard) {
        this.batters = [];
        this.stillToBat = [];
        if (input.scorecard) {
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
                    if (newBatter.batting) { this.hasCurrentBatters = true }
                    if (newBatter.balls > 0) {
                        newBatter.strikeRate = (newBatter.runs / newBatter.balls) * 100;
                    }
                    this.batters.push(newBatter)
                }
            }
        }
    }

    public addOnStrike(input: BatsmenAPI) {
        if (input.batsmen) {
            for (let batter of input.batsmen) {
                let id = batter.ServerPlayerID;
                if (id != '') {
                    let foundBatter = this.batters.find(batter => batter.id == id)
                    if (foundBatter) {
                        foundBatter.batting = true;
                        foundBatter.onStrike = (batter.CurrentPlayer == 'OnStrike')
                    }
                }

            }
        }
    }
}

export class BattingScorecardEntry {
    id: string = '';
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
    hasCurrentBowlers: boolean = false;

    public loadFromAPI(input: WebSportsBowlingScorecard) {
        this.bowlers = [];

        if (input.scorecard) {
            for (let inputBowler of input.scorecard) {
                let newBowler = new BowlingScorecardEntry;
                newBowler.serverPlayerID = inputBowler.ServerPlayerID;
                newBowler.firstname = inputBowler.PlayerName;
                newBowler.surname = inputBowler.PlayerSurname;
                newBowler.bowlerNumber = inputBowler.BowlNr;
                newBowler.overs = inputBowler.OversBowled;
                newBowler.maidens = inputBowler.MaidensBowled;
                newBowler.runs = inputBowler.RunsAgainst;
                newBowler.wickets = inputBowler.Wickets;
                newBowler.noBalls = inputBowler.NoBalls;
                newBowler.wides = inputBowler.Wides;
                newBowler.extras = newBowler.wides + newBowler.noBalls;
                newBowler.totalBalls = inputBowler.TotalBowlerBalls;
                if (newBowler.totalBalls > 0) {
                    newBowler.economy = (newBowler.runs / (newBowler.totalBalls)) * 6;
                }
                this.bowlers.push(newBowler)
            }
        }
    }


    public addCurrentBowlers(input: CurrentBowlers) {
        //update the Bowling Scorecard to reflect who the current bowlers are
        this.hasCurrentBowlers = false;

        //Strike Bowler
        let strikeBowlerInput = input.bowlers.find(a => a.currentPlayer == 'BowlOn');
        if (strikeBowlerInput) {
            let strikeBowler = this.bowlers.find(a => a.firstname === strikeBowlerInput.playerName && a.surname === strikeBowlerInput.playerSurname);
            if (strikeBowler) {
                strikeBowler.strikeBowler = true;
                this.hasCurrentBowlers = true;
            }
        }

        //Non-Strike Bowler
        let nonStrikeBowlerInput = input.bowlers.find(a => a.currentPlayer == 'NotOn');
        if (nonStrikeBowlerInput) {
            let nonStrikeBowler = this.bowlers.find(a => a.firstname === nonStrikeBowlerInput.playerName && a.surname === nonStrikeBowlerInput.playerSurname);
            if (nonStrikeBowler) {
                nonStrikeBowler.nonStrikeBowler = true;
                this.hasCurrentBowlers = true;
            }
        }
    }
}

export class BowlingScorecardEntry {
    serverPlayerID: string = '';
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
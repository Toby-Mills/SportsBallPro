import { BowlersAPI } from './web-sports';

export class CurrentBowlers {
    bowlers: Bowler[] = [];

    public loadFromAPI(input: BowlersAPI): void {
        this.bowlers = [];

        for (let inputBowler of input.bowlers) {
            let bowler = new Bowler;
            bowler.serverPlayerID = inputBowler.ServerPlayerID;
            bowler.currentPlayer = inputBowler.CurrentPlayer;
            bowler.playerName = inputBowler.PlayerName;
            bowler.playerSurname = inputBowler.PlayerSurname;
            bowler.onStrike = inputBowler.Bowler
            bowler.oversBowled = inputBowler.OversBowled || 0;
            bowler.totalBowlerBalls = inputBowler.TotalBowlerBalls || 0;
            bowler.maidensBowled = inputBowler.maidensBowled || 0;
            bowler.runsAgainst = inputBowler.RunsAgainst || 0;
            bowler.wickets = inputBowler.Wickets || 0;
            bowler.wides = inputBowler.Wides || 0;
            bowler.noBalls = inputBowler.NoBalls || 0;
            if (bowler.totalBowlerBalls > 0) {
                bowler.bowlingEconomyRate = (bowler.runsAgainst / bowler.totalBowlerBalls) * 6;
            } else {
                bowler.bowlingEconomyRate = 0;
            }
            bowler.extras = bowler.noBalls + bowler.wides;
            this.bowlers.push(bowler);
        }
    }
}

export class Bowler {
    serverPlayerID: string = '';
    currentPlayer: string = '';
    playerName: string = '';
    playerSurname: string = '';
    oversBowled: number = 0;
    totalBowlerBalls: number = 0;
    maidensBowled: number = 0;
    runsAgainst: number = 0;
    wickets: number = 0;
    wides: number = 0;
    noBalls: number = 0;
    bowlingEconomyRate: number = 0;
    extras: number = 0;
    onStrike: boolean = false;
}
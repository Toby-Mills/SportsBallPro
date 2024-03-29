export class CurrentBowlers {
    bowlers: Bowler[] = [];

    public loadCurrentBowlers(input: any): void {
        this.bowlers = [];

        for (let inputBowler of input.bowlers) {
            let bowler = new Bowler;
            bowler.currentPlayer = inputBowler.CurrentPlayer;
            bowler.playerName = inputBowler.PlayerName;
            bowler.playerSurname = inputBowler.PlayerSurname;
            bowler.oversBowled = inputBowler.OversBowled || 0;
            bowler.totalBowlerBalls = inputBowler.TotalBowlerBalls || 0;
            bowler.maidensBowled = inputBowler.maidensBowled || 0;
            bowler.runsAgainst = inputBowler.RunsAgainst || 0;
            bowler.wickets = inputBowler.Wickets || 0;
            if (bowler.totalBowlerBalls > 0) {
                bowler.bowlingEconomyRate = (bowler.runsAgainst / bowler.totalBowlerBalls) * 6;
            } else {
                bowler.bowlingEconomyRate = 0;
            }
            this.bowlers.push(bowler);
        }
    }
}

export class Bowler {
    currentPlayer: string = '';
    playerName: string = '';
    playerSurname: string = '';
    oversBowled: number = 0;
    totalBowlerBalls: number = 0;
    maidensBowled: number = 0;
    runsAgainst: number = 0;
    wickets: number = 0;
    bowlingEconomyRate: number = 0;
}
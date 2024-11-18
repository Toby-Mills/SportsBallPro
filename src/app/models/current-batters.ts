import { Batsmen } from "./web-sports";

export class CurrentBatters {
    batters: Batter[] = [];

    public loadCurrentBatters(input: Batsmen): void {
        this.batters = [];

        if (input.batsmen) {
            for (let inputBatter of input.batsmen) {
                let batter = new Batter;
                batter.currentPlayer = inputBatter.CurrentPlayer;
                batter.name = inputBatter.PlayerName;
                batter.surname = inputBatter.PlayerSurname;
                batter.runs = inputBatter.BatRuns || 0;
                batter.balls = inputBatter.BatBalls || 0;
                batter.fours = inputBatter.batFours || 0;
                batter.sixes = inputBatter.batSixes || 0;

                if (batter.balls > 0) {
                    batter.strikeRate = (batter.runs / batter.balls) * 100;
                } else {
                    batter.strikeRate = 0;
                }
                this.batters.push(batter);
            }
        }
    }
}

export class Batter {
    currentPlayer: string = '';
    name: string = '';
    surname: string = '';
    runs: number = 0;
    balls: number = 0;
    fours: number = 0;
    sixes: number = 0;
    strikeRate: number = 0;
}

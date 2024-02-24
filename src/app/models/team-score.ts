export class TeamScore {
    teamName: string = '';
    logoName: string = '';
    runs: number = 0;
    wickets: number = 0;
    overs: number = 0;
    extras: number = 0;
    runRate: number = 0;

    load(input:any, teamNumber:number){

        if(teamNumber == 1){
            this.teamName = input.aTeam;
            this.logoName = input.aLogoName;
            this.runs = input.aRuns;
            this.wickets = input.aWickets;
            this.overs = input.aOvers;
            this.extras = input.aExtras;
        }

        if(teamNumber == 2){
            this.teamName = input.bTeam;
            this.logoName = input.bLogoName;
            this.runs = input.bRuns;
            this.wickets = input.bWickets;
            this.overs = input.bOvers;
            this.extras = input.bExtras;
        }

        //calculate run rate
        if (this.overs > 0){
            let fullOvers = Math.floor(this.overs);
            let balls = this.overs%1;
            balls = (balls / 0.6)
            let decimalOvers = fullOvers + balls;
            this.runRate = this.runs / decimalOvers;
        } else {
            this.runRate = 0;
        }

    }
}

export class Match {
    LastUpdate: string = ''
    gameID: string = '';
    game: string = '';
    fixtureDate: string = ''
    datePlayed: Date = new Date();
    venueDescription: string = '';
    tossWonByTeam: string = '';
    decidedTo: string = '';
    aTeamId: number = 0;
    bTeamId: number = 0;
    aTeamName: string = '';
    bTeamName: string = '';
    aLogoName: string = '';
    bLogoName: string = '';
    inningsId: number = 0;
    aRuns: number = 0;
    bRuns: number = 0;
    RunsRequired: string = '';
    BreaksInPlay: string = '';
    result: string = '';
    signature: string = '';

    public loadMatch(input:any):void {
        this.gameID = input.gameID;
        this.game = input.game
        this.fixtureDate = input.fistureDate
        this.datePlayed = input.datePlayed
        this.venueDescription = input.venueDescription
        this.tossWonByTeam = input.tossWonByTeam;
        this.decidedTo = input.decidedTo;
        this.aTeamId = input.aTeamID;
        this.bTeamId = input.bTeamID
        this.aTeamName = input.aTeam;
        this.bTeamName = input.bTeam;
        this.aLogoName = input.aLogoName;
        this.bLogoName = input.bLogoName;
        this.RunsRequired = input.RunsRequired;
        this.BreaksInPlay = input.BreaksInPlay;
        this.result = input.result;
    }

    public loadAdditionalData(input: any): void {
        if (input.fixtures.length > 0) {
            this.aTeamId = input.fixtures[0].aTeamID;
            this.bTeamId = input.fixtures[0].bTeamID;
            this.inningsId = input.fixtures[0].InningsID;
        } else {
            this.aTeamId = 0;
            this.bTeamId = 0;
            this.inningsId = 0;
        }
    }
}
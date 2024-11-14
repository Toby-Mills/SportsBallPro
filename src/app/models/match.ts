import {Fixture} from '../models/web-sports';

export class Match {
    LastUpdate: string = ''
    gameID: string = '';
    game: string = '';
    fixtureDate: string = ''
    datePlayed: Date = new Date();
    venueDescription: string = '';
    tossWonByTeam: string = '';
    decidedTo: string = '';
    aTeamId: string = '';
    bTeamId: string = '';
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

    public loadMatch(input:Fixture):void {
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

    public loadAdditionalData(input: Fixture): void {
            this.aTeamId = input.aTeamID;
            this.bTeamId = input.bTeamID;
            this.inningsId = input.InningsID;
    }
}
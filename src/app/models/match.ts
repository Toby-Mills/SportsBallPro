import { Fixture, BattingScorecard, BattingLineup } from '../models/web-sports';
import {  } from './scorecard';

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
    aTeamBatters: PlayerLineup = new PlayerLineup;
    bTeamBatters: PlayerLineup = new PlayerLineup;
    inningsId: number = 0;
    aRuns: number = 0;
    bRuns: number = 0;
    RunsRequired: string = '';
    BreaksInPlay: string = '';
    result: string = '';
    signature: string = '';

    public loadMatch(input: Fixture): void {
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

    public loadFixtureData(input: Fixture): void {
        this.aTeamId = input.aTeamID;
        this.bTeamId = input.bTeamID;
        this.inningsId = input.InningsID;
    }

    public loadBattingLineup(input: BattingLineup, teamId:string): void {
        let batters:Array<Player> = [];

        if(teamId == this.aTeamId){batters = this.aTeamBatters.lineup}
        else {batters = this.bTeamBatters.lineup}

        while (batters.length > 0) {batters.pop()}

        for (let inputPlayer of input.team){
            let player = new Player();
            player.firstName = inputPlayer.PlayerName;
            player.surname = inputPlayer.PlayerSurname;
            player.number = inputPlayer.Number;
            player.playerId = inputPlayer.PlayerID
            batters.push(player);
        }
    }
}

export class PlayerLineup {
    lineup: Array<Player> = []
}

export class Player {
    playerId: number = 0
    number: number = 0
    firstName: string = ''
    surname: string = ''
}
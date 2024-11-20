import { Fixture as WebsportsFixture, BattingScorecard, BattingLineup, WagonWheel } from '../models/web-sports';
import { InningsDetail } from './innings-detail';
import { RunComparison } from './run-comparison';
import { } from './scorecard';
import { TeamScore } from './team-score';

export class Match {
    fixture: Fixture = new Fixture;
    status: Status = new Status;
    teamAScore: TeamScore = new TeamScore;
    teamBScore: TeamScore = new TeamScore;
    teamABatterLineup: PlayerLineup = new PlayerLineup;
    teamBBatterLineup: PlayerLineup = new PlayerLineup;

    signature: string = '';
    innings1Detail: InningsDetail = new InningsDetail;
    innings2Detail: InningsDetail = new InningsDetail;
    runComparison: RunComparison = new RunComparison;
    wagonWheel: WagonWheel = new WagonWheel;

    public constructor() {
        this.teamAScore.teamNumber = 1;
        this.teamBScore.teamNumber = 2;
        this.innings1Detail.number = 1;
        this.innings2Detail.number = 2;
    }

    public loadFixture(input: WebsportsFixture): void {
        this.fixture.gameId = input.gameID;
        this.fixture.game = input.game
        this.fixture.fixtureDate = input.fistureDate
        this.fixture.datePlayed = input.datePlayed
        this.fixture.venueDescription = input.venueDescription
        this.fixture.teamAId = input.aTeamID;
        this.fixture.teamBId = input.bTeamID
        this.fixture.teamAName = input.aTeam;
        this.fixture.teamBName = input.bTeam;
        this.fixture.teamALogoName = input.aLogoName;
        this.fixture.teamBLogoName = input.bLogoName;

        this.status.tossWonByTeam = input.tossWonByTeam;
        this.status.decidedTo = input.decidedTo;
        this.status.runsRequired = input.RunsRequired;
        this.status.result = input.result;
    }

    public loadTeamIds(input: WebsportsFixture): void {
        this.fixture.teamAId = input.aTeamID;
        this.fixture.teamBId = input.bTeamID;
    }

    public loadBattingLineup(input: BattingLineup, teamId: string): void {
        let batters: Array<Player> = [];

        if (teamId == this.fixture.teamAId) { batters = this.teamABatterLineup.lineup }
        else { batters = this.teamBBatterLineup.lineup }

        while (batters.length > 0) { batters.pop() }

        for (let inputPlayer of input.team) {
            let player = new Player();
            player.firstName = inputPlayer.PlayerName;
            player.surname = inputPlayer.PlayerSurname;
            player.number = inputPlayer.Number;
            player.playerId = inputPlayer.PlayerID
            batters.push(player);
        }
    }
}

export class Fixture {
    gameId: string = '';
    game: string = '';
    fixtureDate: string = ''
    datePlayed: Date = new Date();
    venueDescription: string = '';
    teamAId: string = '';
    teamBId: string = '';
    teamAName: string = '';
    teamBName: string = '';
    teamALogoName: string = '';
    teamBLogoName: string = '';
}

export class Status {
    tossWonByTeam: string = '';
    decidedTo: string = '';
    runsRequired: string = '';
    result: string = '';
    currentInnings: 1 | 2 = 1;
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
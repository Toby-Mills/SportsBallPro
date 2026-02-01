import { Fixture as WebsportsFixture, BattingScorecard, BattingLineup } from '../models/web-sports';

import { BattingInningsDetail } from './innings-detail';
import { Innings } from './innings';
import { RunComparison } from './run-comparison';
import { } from './scorecard';
import { TeamScore } from './team-score';
import { WagonWheel } from './wagon-wheel';

export class Match {
    static readonly STRUCTURE_VERSION = 2;
    
    fixture: Fixture = new Fixture;
    status: Status = new Status;
    teamAScore: TeamScore = new TeamScore;
    teamBScore: TeamScore = new TeamScore;
    innings: Innings[] = [];
    runComparison: RunComparison = new RunComparison;
    wagonWheel: WagonWheel = new WagonWheel;

    signature: string = '';

    public constructor() {
        this.teamAScore.teamNumber = 1;
        this.teamBScore.teamNumber = 2;
        
        // Initialize 2 innings
        for (let i = 1; i <= 2; i++) {
            const innings = new Innings();
            innings.number = i;
            
            // Initialize 2 batting innings per innings (one for each team)
            for (let t = 1; t <= 2; t++) {
                const battingInnings = new BattingInningsDetail();
                battingInnings.teamNumber = t;
                innings.battingInnings.push(battingInnings);
            }
            
            this.innings.push(innings);
        }
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

    public loadLineup(type: 'Batting'|'Bowling', inningsNumber: 1|2, teamNumber: 1|2, input: BattingLineup): void {
        const battingInnings = this.innings[inningsNumber - 1].battingInnings[teamNumber - 1];
        let lineup: Array<Player> = type === 'Batting' ? battingInnings.battingLineup.lineup : battingInnings.bowlingLineup.lineup;

        while (lineup.length > 0) { lineup.pop() }

        for (let inputPlayer of input.team) {
            let player = new Player();
            player.firstName = inputPlayer.PlayerName;
            player.surname = inputPlayer.PlayerSurname;
            player.number = inputPlayer.Number;
            player.playerId = inputPlayer.PlayerID
            lineup.push(player);
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
    currentTeam: 1 | 2 = 1;
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
import { FixtureAPI, BattingScorecardAPI, BattingLineupAPI } from '../models/web-sports';

import { BattingInningsDetail, Player, PlayerLineup } from './batting-innings-detail';
import { Innings } from './innings';
import { RunComparison } from './run-comparison';
import { } from './scorecard';
import { TeamScore } from './team-score';
import { WagonWheel } from './wagon-wheel';

export class Match {
    static readonly STRUCTURE_VERSION = 3;
    
    fixture: Fixture = new Fixture;
    status: Status = new Status;
    teamAScore: TeamScore = new TeamScore;
    teamBScore: TeamScore = new TeamScore;
    innings: Innings[] = []; // Each innings contains 2 BattingInningsDetail objects, one for each team
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

    public loadFromAPI(input: FixtureAPI): void {
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

    public loadTeamIdsFromAPI(input: FixtureAPI): void {
        this.fixture.teamAId = input.aTeamID;
        this.fixture.teamBId = input.bTeamID;
    }

    public loadLineupFromAPI(type: 'Batting'|'Bowling', inningsNumber: 1|2, teamNumber: 1|2, input: BattingLineupAPI): void {
        const battingInnings = this.innings[inningsNumber - 1].battingInnings[teamNumber - 1];
        const playerLineup = type === 'Batting' ? battingInnings.battingLineup : battingInnings.bowlingLineup;
        playerLineup.loadFromAPI(input);
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
    result: string = '';
    teamAScore: number = 0;
    teamBScore: number = 0;
    
    public loadFromAPI(input: any): void {
        this.gameId = input.gameID || '';
        this.game = input.game || '';
        this.fixtureDate = input.datePlayed || '';
        this.datePlayed = new Date(input.datePlayed);
        this.venueDescription = input.venueDescription || '';
        this.teamAId = input.aTeamID || '';
        this.teamBId = input.bTeamID || '';
        this.teamAName = input.aTeam || '';
        this.teamBName = input.bTeam || '';
        this.teamALogoName = input.aTeamLogoName || '';
        this.teamBLogoName = input.bTeamLogoName || '';
        this.result = input.result || '';
        this.teamAScore = input.aRuns || 0;
        this.teamBScore = input.bRuns || 0;
    }
}

export class Status {
    tossWonByTeam: string = '';
    decidedTo: string = '';
    runsRequired: string = '';
    result: string = '';
    currentInnings: 1 | 2 = 1;
    currentTeam: 1 | 2 = 1;
}
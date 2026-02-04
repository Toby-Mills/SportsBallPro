import { Fixture } from './match';

export class FixtureSummaries {
    fixtureSummaries: FixtureSummary[]= [];

    /**
     * Load fixture summaries from an array of internal Fixture models
     */
    public loadFixtures(input: { fixtures: Fixture[] }){
        for (let fixture of input.fixtures){
            let newFixture = new FixtureSummary;
            newFixture.gameId = fixture.gameId || '';
            newFixture.game = fixture.game || '';
            newFixture.date = fixture.fixtureDate || '';
            newFixture.datePlayed = fixture.datePlayed || new Date();
            newFixture.loadAdditionalAttributes();
            this.fixtureSummaries.push(newFixture);
        }
    }
}

export class FixtureSummary {
    gameId:  string = '';
    game: string = '';
    date: string = '';
    datePlayed: Date = new Date();
    matchKey: string = '';
    teamAName: string = '';
    teamBName: string = '';
    description: string = '';

    public loadAdditionalAttributes(){
        const teams = this.game.split(' vs ');
        this.teamAName = teams[0] || '';
        this.teamBName = teams[1] || '';
    }
    
}

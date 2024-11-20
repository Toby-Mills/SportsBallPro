export class FixtureSummaries {
    fixtureSummaries: FixtureSummary[]= [];

    public loadFixtures(input: any){
        for (let fixture of input.fixtures){
            let newFixture = new FixtureSummary;
            newFixture.gameId = fixture.gameID;
            newFixture.game = fixture.game;
            newFixture.date = fixture.fixtureDate;
            newFixture.datePlayed = fixture.datePlayed;
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
        this.teamAName = teams[0];
        this.teamBName = teams[1];
    }
    
}

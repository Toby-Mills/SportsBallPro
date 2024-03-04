export class Fixtures {
    fixtures: Fixture[]= [];

    public loadFixtures(input: any){
        for (let fixture of input.fixtures){
            let newFixture = new Fixture;
            newFixture.gameId = fixture.gameID;
            newFixture.game = fixture.game;
            newFixture.date = fixture.fixtureDate;
            this.fixtures.push(newFixture);
        }
    }
}

export class Fixture {
    gameId:  string = '';
    game: string = '';
    date: string = '';
    matchKey: string = '';
}
